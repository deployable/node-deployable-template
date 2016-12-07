// # `Properties`

//import * as mustache from 'mustache'
const debug     = require('debug')('dply::module-template::template_set')
const Promise   = require('bluebird')
const path      = require('path')
//const fs        = Promise.promisifyAll(require('fs'))
const fs        = Promise.promisifyAll(require('fs-extra'))
const Handlebars = require('handlebars')
const {isNil, escapeRegExp} = require('lodash')
const Walk      = require('./walk')
const _         = require('lodash')
const {ExtendedError}    = require('deployable-errors')


class PropertiesError extends ExtendedError {
  constructor( message, options = {} ){
    super(message, options)
    this.description = options.description
  }
}

const ends_with_path_sep_re = new RegExp(`${escapeRegExp(path.sep)}$`)
const endPathWithPathSep = function( path_str ){
  if ( ! path_str.match(ends_with_path_sep_re) )
    path_str += path.sep
  return path_str
}

// ## Class `Properties`

//export class Properties {
module.exports = class Properties {

  constructor ( name, options = {} ) {
    if (name === undefined) throw new Error('Pass a name to Properties')
    
    // The name of the template set to use
    this.base_name = name
    
    // The base path where the named template sets live
    this.base_path = (isNil(options.base_path)) ? path.join(__dirname, '..', 'template') : options.base_path

    // The path to output rendered templates to
    this.output_path = (isNil(options.output_path)) ? path.join(__dirname, '..', 'tmp') : options.output_path

    // Vars to render templates with`
    this.properties = options.properties || {}
    debug('using properties', this.properties)
    
    // Replace files
    this.replace = !!options.replace

    //this.files = Walk.dir(this.path).catch(error => this.error = error)
  }

  set base_path (_base_path) {
    this._base_path = path.resolve(_base_path)
  }
  get base_path (){
    return this._base_path
  }

  set output_path (_output_path) {
    this._output_path = path.resolve(_output_path)
  }
  get output_path (){
    return this._output_path
  }

  // Build the template path
  get path () {
    return path.join( this.base_path, this.base_name )
  }

  // Remove the base path from any paths in the files array
  stripPrefixFromPaths( files, base_path ){
    if (!base_path) base_path = path.join(this.base_path, this.base_name)
    base_path = endPathWithPathSep(base_path)
    let re_base_path = new RegExp(`^${escapeRegExp(base_path)}`)
    return files.map( item => item.replace(re_base_path,'') )
  }

  readConfig(){
    let file_path = path.resolve(this.base_path, this.base_name, 'template.yml')
    fs.readFileAsync(file_path, 'utf8')
  }

  // Promise to find the files in the named template set
  findTemplateFiles ( dir_path ) {
    if (!dir_path) dir_path = this.path
    dir_path = path.resolve(this.base_path, this.base_name, 'files')
    return Walk.dir(dir_path).then( files => {
      return this.files = this.stripPrefixFromPaths(files, dir_path)
    })
    .catch({code: 'ENOENT'}, error => {
      error.original_message = error.message
      error.message = `Failed to read template set "${this.base_name}"
    No such file or directory "${error.path}"`
      throw error
    })
  }

  // Read a template file
  // Resolves the template path for you
  readTemplateFile(file) {
    let file_path = path.resolve(this.base_path, this.base_name, 'files', file)
    debug('readTemplateFile', file_path)
    return fs.readFileAsync(file_path, 'utf8')
  }

  // Write a file with data
  // returns a promise to write
  writeFile(file_path, data) {
    debug('writeFile', file_path)
    return fs.writeFileAsync(file_path, data, 'utf8')
  }

  // Make all directories
  // returns a promise
  mkdirs(dir_path) {
    debug('mkdirs', dir_path)
    return fs.mkdirsAsync(dir_path)
  }

  // Check if a path already exists according to our *replace* rules
  pathExists (output_path) {
    debug('checking for output path', output_path)
    if (this.replace) return Promise.resolve(false)
    return fs.statAsync(output_path)
      .then( () => {
        throw new PropertiesError(
          `Output path exists "${this.output_path}"`,
          {description: 'Set the `replace` option to allow writing over existing files'}
        )
      })
      .catch( {code: 'ENOENT'}, () => false )
  }

  // Template all files in the set
  templateFiles() {
    return Promise.map(this.files, file => {
      debug( 'templating file', file )
      return this.templateFile(file)
        .then( newdata => this.writeTemplateFile(file,newdata) )
    })
  }

  // Template all files in the set
  // entrypoint
  go() {
    return this.readConfig()
      .then(() => this.findTemplateFiles() )
      .then(() => this.pathExists(this.output_path) )
      .then(() => this.templateFiles() )
  }


  // Template a file in the set
  templateFile(file, properties) {
    if (!properties) properties = this.properties
    return this.readTemplateFile(file)
      .then( data => { 
        //let errors = []
        //let fields = Handlebars.parse(data)
        debug('handlebar file', file)
        let template = Handlebars.compile(data, {strict: true})
        // _.filter(fields, v => v[0] === 'name').forEach(token => {
        //   let name = token[1]
        //   if ( !_.has(properties,name) ) errors.push({name: name, file: file})
        // })
        // if (!_.isEmpty(errors)) {
        //   let description = errors.map(val => `${val.name} in ${val.file}`).join("\n ")
        //   throw new PropertiesError('Missing property for template file', {description: description})
        // }
        return template(properties)
      })
  }

  // Write a template file to the output dir
  writeTemplateFile(file, data) {
    let file_path = path.join(this.output_path, file)
    let file_dirname = path.dirname(file_path)
    debug('writeTemplateFile writing to', file_path)
    return this.mkdirs(file_dirname)
      .then( () => this.pathExists(file_path) )
      .then( () => this.writeFile(file_path, data) )
      .then( () => file_path )
  }

  // Auto population of files on object creation. 
  // Kind of pointless as it makes tracking errors hard and 
  // You still need a promise to call this
  //waitForFiles (ms = 5, timeout = 30000) {
  waitForFiles (ms = 5) {
    if (ms > 1000) ms = 1000
    debug('waitFiles', ms)
    if (this.files) return Promise.resolve(this.files)
    return Promise.delay(ms)
      .then( () => resolve(this.waitForFiles(ms+5)) )
  }

}

module.exports.PropertiesError = PropertiesError
