// # `Properties`

//import * as mustache from 'mustache'
const debug     = require('debug')('dply::module_template::properties')
const Promise   = require('bluebird')
const path      = require('path')
//const fs        = Promise.promisifyAll(require('fs'))
const fs        = Promise.promisifyAll(require('fs-extra'))
const {isNil, escapeRegExp} = require('lodash')


class PropertyError extends Error {
  constructor(message){
    super(message)
    this.description = 'Set the `replace` option to allow writing over existing files'
  }
}

// ## Class `Properties`
//export class Properties {
module.exports = class Properties {

  constructor ( options = {} ) {

    // The base path where the named template sets live
    this.base_path = (isNil(options.base_path)) ? path.join(__dirname, '..', 'properties') : options.base_path

    this.defaults = options.defaults

    this.overrides = options.overrides

  }

  set base_path (_base_path) {
    this._base_path = path.resolve(_base_path)
  }
  get base_path (){
    return this._base_path
  }

  get defaults () { return this._defaults }
  set defaults (_defaults) { this._defaults = _defaults }

  get overrides () { return this._overrides }
  set overrides (_overrides) { this._overrides = _overrides }

  // Read a property file
  // Resolves the property path for you
  readPropertyFile(file) {
    let file_path = path.resolve(this.base_path, file)
    debug('readPropertyFile', file_path)
    return fs.readFileAsync(file_path, 'utf8')
  }

  // Remove the base path from any paths in the files array
  stripPrefixFromPaths( files ){
    let base_path = path.join(this.base_path, this.base_name) + path.sep
    let re_base_path = new RegExp(`^${escapeRegExp(base_path)}`)
    return files.map( item => item.replace(re_base_path,'') )
  }

  go() {
    return this.findFiles()
      .then( ()=> this.pathExists(this.output_path) )
      .then( ()=> this.templateFiles() )
  }

  // Auto population of files on object creation. 
  // Kind of pointless as it makes tracking errors hard 
  //waitForFiles (ms = 5, timeout = 30000) {
  waitForFiles (ms = 5) {
    if (ms > 1000) ms = 1000
    debug('waitFiles', ms)
    if (this.files) return Promise.resolve(this.files)
    return Promise.delay(ms).then( ()=> resolve(this.waitForFiles(ms+5)) )
  }

}

module.exports.PropertyError = PropertyError
