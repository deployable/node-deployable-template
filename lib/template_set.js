//import * as mustache from 'mustache'
const debug     = require('debug')('dply::module_template')
const Promise   = require('bluebird')
const path      = require('path')
const os        = require('os')
const fs        = Promise.promisifyAll(require('fs'))
const fse       = Promise.promisifyAll(require('fs-extra'))
const Mustache  = require('mustache')
const {isNil, escapeRegExp} = require('lodash')
const Walk      = require('./walk')


//export class TemplateSet {
module.exports = class TemplateSet {

  constructor ( name, options = {} ) {
    if (name === undefined) throw new Error('Pass a name to TemplatSet')
    this.base_name = name
    this.base_path = (isNil(options.base_path)) ? path.join(__dirname, '..', 'template') : options.base_path
    this.output_path = (isNil(options.output_path)) ? path.join(__dirname, '..', 'tmp') : options.output_path
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

  stripPrefixFromPaths( files ){
    let base_path = this.base_path + path.sep
    let re_base_path = new RegExp(`^${escapeRegExp(base_path)}`)
    return files.map( item => item.replace(re_base_path,'') )
  }

  // Promise to find the template sets files
  findFiles () {
    return Walk.dir(this.path).then( files => {
      let base_path = this.base_path + path.sep
      let re_base_path = new RegExp(`^${escapeRegExp(base_path)}`)
      let stripped_files = this.stripPrefixFromPaths(files)
      return this.files = stripped_files
    })
    .catch({code: 'ENOENT'}, error => {
      error.message = `No such file or directory "${error.path}"`
      error.simple = `Failed to read templates for "${this.base_name}"`
      throw error
    })
  }

  readTemplateFile(file) {
    let file_path = path.resolve(this.base_path, file)
    debug('readTemplateFile', file_path)
    return fs.readFileAsync(file_path, 'utf8')
  }

  writeFile(file_path, data) {
    debug('writeFile', file_path)
    return fs.writeFileAsync(file_path, data, 'utf8')
  }

  mkdirs(dir_path) {
    debug('mkdirs', dir_path)
    return fse.mkdirsAsync(dir_path)
  }

  writeTemplateFile(file, data) {
    let file_path = path.join(this.output_path, file)
    let file_dirname = path.dirname(file_path)
    debug('writeTemplateFile writing to', file_path)
    return this.mkdirs(file_dirname)
      .then(()=> this.writeFile(file_path, data))
      .then(()=> file_path)
  }

  templateFile(file) {
    return this.readTemplateFile(file).then( data => {
      return Mustache.render("{{title}} spends {{calc}}", data);
    })
  }

  templateFiles() {
    return Promise.map(this.files, file => {
      return this.templateFile(file).then(newdata => this.writeTemplateFile(file,newdata))
    })
  }

  // Auto population of files on object creation. 
  // Kind of pointless as it makes tracking errors hard 
  waitForFiles (ms = 5) {
    if (ms > 1000) ms = 1000
    debug('waitFiles', ms)
    return new Promise((resolve, reject) => {
      if (this.files) return resolve(this.files)
      return Promise.delay(ms).then(() => resolve(this.waitForFiles(ms+5)))
    })
  }

}
