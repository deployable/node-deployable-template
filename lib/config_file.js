
// # ConfigFile

// Manage a config file with data

const debug = require('debug')('dply:template:config_file')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const YAML = require('js-yaml')
const _ = require('lodash')
const ree = _.escapeRegExp

const {ExtendedError} = require('@deployable/errors')


//export class ConfigFileError extends ExtendedError {
class ConfigFileError extends ExtendedError {
  constructor ( message, options = {} ) {
    super(message, options)
    if (_.has(options, 'key'))   this.key = options.key
    if (_.has(options, 'value')) this.value = options.value
  }
}


//export class ConfigFile {
class ConfigFile {

  static new () { return new ConfigFile(arguments) }

  constructor ( options = {}) {

    // Path to the file
    // Without one we don't acheive much
    this.path = options.path

    // Contents of the file when loaded
    this.original_file = null

    // Standard file types
    // 'yaml' || 'json' || 'ini' || 'config' || 'javaProperties'
    this.type = options.type || 'config'

    // Allow spaces at the beginning of the line
    this.allow_spaces = _.defaultTo(options.key_prefix, true)

    // Something before the 
    this.key_prefix = _.defaultTo(options.key_prefix, '')

    this.key_re = _.defaultTo(options.key_re, /[\w-]+?/)

    // Something after the key
    this.key_suffix = _.defaultTo(options.key_suffix, '')

    // Something before the seperator?
    // '' | ' '
    this.seperator_prefix = _.defaultTo(options.seperator_prefix, ' ')

    // key sep value
    // = | : | ' ' | '' | \t
    this.seperator = _.defaultTo(options.seperator, '=') 

    // Something after the seperator?
    this.seperator_suffix = _.defaultTo(options.seperator_suffix, ' ')

    // Something before the seperator?
    // '' | ' | "
    this.value_prefix = _.defaultTo(options.value_prefix, '')

    // Something after the seperator?
    // '' | ' | "
    this.value_suffix = _.defaultTo(options.value_suffix, '')

    // Match the value, gets anything that's not a seperator by default
    this.value_re = options.value_re || /.+?/

    // A regular expression to read in files with
    // This will be unset whenever one of the constituent variables above changes
    if (options.config_line_re !== undefined)
      this.config_line_re = options.config_line_re

    // Comment char (start of line only)
    this.comment = options.comment || '#' || ';' || '!'
    this.comment_re = options.comment_re || new RegExp(`^\s*${this.comment}`)

    // The max depth of keys posible. 0 in unlimited
    this.depth = options.depth || 0 || 1 //...

    // File line end mode
    this.mode = options.mode || 'unix' || 'dos' || 'cr' || 'lf' || 'crlf' || 'lfcr'

    // A place to store our values
    this.store = {}

  }

  
  // ### Getters and setters

  // Re to parse an existing line
  // This will be unset whenever one of the constituent variables below changes
  set config_line_re(re) { this._config_line_re = re }
  get config_line_re() {
    if (this._config_line_re) return this._config_line_re
    
    // ree is _.escapeRegExp
    let re_str = ''
    if ( this.allow_spaces ) re_str += '(\s*)'
    // key
    re_str += `${ree(this.key_prefix)}(${this.key_re.source})${ree(this.key_suffix)}`
    // sep
    re_str += ree(`${this.seperator_prefix}${this.seperator}${this.seperator_suffix}`)
    // val
    re_str += `${ree(this.value_prefix)}(${this.value_re.source})${ree(this.value_suffix)}`
    re_str += '(.+)' // the line may have extra bits
    
    let re = this._config_line_re = new RegExp(`^${re_str}$`)
    debug('generated re', re, re_str)
    return re
  }

  // char before value
  get key_prefix()  { return this._key_prefix }
  set key_prefix(str){
    this._config_line_re = undefined
    return this._key_prefix = str
  }

  // re to match the key
  get key_re()  { return this._key_re }
  set key_re(re){
    this._config_line_re = undefined
    return this._key_re = re
  }

  // char before value
  get key_prefix()  { return this._key_prefix }
  set key_prefix(str){
    this._config_line_re = undefined
    return this._key_prefix = str
  }

  // char before seperator
  get seperator_prefix()  { return this._seperator_prefix }
  set seperator_prefix(str){
    this._config_line_re = undefined
    return this._seperator_prefix = str
  }
  // Seperator char, usually =
  get seperator()  { return this._seperator }
  set seperator(str){
    this._config_line_re = undefined
    return this._seperator = str
  }
  // char after seperator
  get seperator_suffix()  { return this._seperator_suffix }
  set seperator_suffix(str){
    this._config_line_re = undefined
    return this._seperator_suffix = str
  }

  // char before value
  get value_prefix()  { return this._value_prefix }
  set value_prefix(str){
    this._config_line_re = undefined
    return this._value_prefix = str
  }

  // re to match value
  get value_re()  { return this._value_re }
  set value_re (re){
    return this._value_re = re
  }

  // char after suffix
  get value_suffix()  { return this._value_suffix }
  set value_suffix (str){ 
    this._config_line_re = undefined
    return this._value_suffix = str
  }

  // Max depth of store
  get depth() { return this._depth }
  set depth(n){
    this.nested = ( n === 1 ) ? false : false
    this._depth = n
  }

  // Shortcut for setting key prefix and suffix to the same string
  set surround_key(string){ 
    this.key_prefix = string
    this.key_suffix = string
  }

  // Shortcut for setting seperator prefix and suffix to the same string
  set surround_seperator(string){ 
    this.seperator_prefix = string
    this.seperator_suffix = string
  }

  // Shortcut for setting value prefix and suffix to the same string
  set surround_value(string){ 
    this.value_prefix = string
    this.value_suffix = string
  }

  get line_ending(){
    switch (this.mode) {
      case 'lf':
      case 'unix': return '\n'
      
      case 'crlf':
      case 'dos':  return '\r\n'
      
      case 'cr':   return '\r'

      case 'lfcr': return '\n\r'
      
      default: throw new ConfigFileError(`Unknown file mode ${this.mode}`, {mode: this.mode})
    }
  }


  // ### Mode helpers

  modeYaml(){
    this.type = 'yaml'
    this.depth = 0
    return this
  }

  modeJSON(){
    this.type = 'json'
    this.depth = 0
    return this
  }

  modeApache(){
    this.type = 'xml'
    this.depth = 0
    return this
  }

  modeJavaProperties(){
    this.type = 'javaProperties'
    this.depth = 1
    this.seperator = '='
    this.surround_seperator = ' '
    this.comment = '#'
    return this
  }

  // This will need something custom to deal with the first layer
  // being a section.
  // if key is object -> section
  modeIni () {
    this.type = 'ini'
    this.depth = 2
    this.seperator = '='
    this.surround_seperator = ''
    this.comment = ';'
    this.section = '[{{key}}]'
    this.depth = 1

    this.generate = (value, key) => {
      if ( _.isObject(value) ) {
        let section_lines = _.map( value, (svalue, skey) => this.generateLine(skey, svalue) )
        return `[${key}]\n${section_lines.join('\n')}\n`
      }
      return this.generateLine(key, value)
    }

    return this
  }


  // ### Store methods

  // . means new object
  // [] mean new array
  set (key, value) {
    if (value === undefined) throw new PropertiesError('Value is undefined', {key: key})
    return _.set(this.store, key, value)
  }

  // . means get property
  // [0] mean get array
  get (key) {
    return _.get(this.store, key)
  }

  exists (key) {
    return _.has(this.store, key)
  }

  replace (key, value) {
    if ( this.exists(key) ) this.set(key, value)
    else throw new PropertiesError('Value doesn\'t exist', { key: key, value: value })
  }

  
  generateLine (key, value) {
    let line = ''
    line += `${this.key_prefix}${key}${this.key_suffix}`
    line += `${this.seperator_prefix}${this.seperator}${this.seperator_suffix}`
    line += `${this.value_prefix}${value}${this.value_suffix}`
    return line
  }

  // Generates a new file from the `store`
  generateConfigContents () {
    let generate_fn = (this.generate)
      ? this.generate 
      : (value, key) => this.generateLine(key, value)
    return _.map(this.store, generate_fn)
  }

  // Regenerates the original file, replacing values or adding them
  // Keeps comments etc
  generateOriginalFile () {
    return _.map(this.original_file.split('\n'), line => {
      if ( line.match(/^\s*$/) ) return line
      let m = line.match(this.config_line_re)
      if ( !m ) return line
      let line_key = m[0]
      let line_value = m[1]
      debug('found key "%s" value "%s" in line', line_key, line_value, line)
      if ( this.has(key) ) {
        let value = this.get(key)
        debug('replaced key "%s" value "%s" with new value "%s"', line_key, line_value, value)
        let new_line = this.generateLine(key, value)
        debug('new line', new_line)
      }
    })
  }

  generateFile(){
    switch ( this.type ) {
      case 'yaml': return YAML.dump(this.store)
      case 'json': return JSON.stringify(this.store)
      default: return this.generateConfigContents().join(this.line_ending)
    }
  }

  // Write a new file with just properties.
  // This creates s promise so sync code is caught.
  writeFile () {
    return new Promise((resolve, reject) => {
      let contents = this.generateFile()
      debug('writing file', this.path)
      return fs.writeFileAsync(this.path, contents)
        .then(() => {
          debug('file written', this.path)
          return resolve(true)
        })
    })
  }

  // Read a file in
  readFile () {
    return fs.readFileAsync(this.path, this.mode).then(data => {
      this.original_file = data
      this.store = YAML.safeLoad(data)
      this.store = JSON.parse(data)
      return data
    })
  }

}

// const props = new Properties();
// props.put("batch.size", "200");
// props.put("producer.type", "async");
// props.put("connect.timeout.ms", "5000");
// props.put("request.required.acks", "0");
// props.put("metadata.broker.list", "10.10.73.52:9092,10.10.70.15:9092");
// props.put("serializer.class", "kafka.serializer.DefaultEncoder");
// props.put("partitioner.class", "kafka.producer.DefaultPartitioner");

module.exports = { ConfigFile, ConfigFileError }
