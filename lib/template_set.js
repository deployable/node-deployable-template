//import * as mustache from 'mustache'
//const mustache = require('mustache')
const debug = require('debug')('dply::module_template')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fse = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const Walk = require('./walk')


module.exports = class TemplateSet {

  constructor ( name, options = {} ) {
    if (name === undefined) throw new Error('Pass a name to TemplatSet');
    this.base_name = name
    this.base_path = (options.base_path === undefined) ? path.join(__dirname,'..', 'template') : options.base_path
    this.files = null
    this.errors = (options.errors) ? options.error : null
    Walk.dir(this.path, this.errors).then(files => this.files = files)
  }

  get path () {
    return path.join( this.base_path, this.base_name )
  }

  waitForFiles (ms = 20) {
    if (ms > 1000) ms = 1000
    debug('waitFiles')
    return new Promise((resolve, reject) => {
      if (this.files) return resolve(this.files)
      return Promise.delay(ms).then(() => resolve(this.waitForFiles(ms+10)))
    })
  }

}

// ts = new TemplateSet('base')
// console.log(ts.files)
// ts.waitFiles().then(console.log)

