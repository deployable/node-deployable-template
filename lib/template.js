//import * as mustache from 'mustache'
//const mustache = require('mustache')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fse = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const debug = require('debug')('dply::module_template')

class TemplateSet {

  constructor ( name, options = {} ) {
    this.base_name = name
    this.base_path = path.join('..', 'template')
    this.files = null
    this.walkDir().then(files => this.files = files)
  }

  get path () {
    return path.join( this.base_path, this.base_name )
  }

  waitFiles () {
    debug('waitFiles')
    return new Promise((resolve, reject) => {
      if (this.files) return resolve(this.files)
      return Promise.delay(100).then(() => resolve(this.waitFiles()))
    })
  }

  walkDir (file_cb) {
    return new Promise((resolve, reject) => {
      let entries = []
      //fse.walk(this.path)
      fse.walk('/Users/matt/clones/deployable')
        .on('data', item => {
          entries.push(item.path.replace(/\/Users\/matt\/clones\/deployable/,''))
          if (entries.length % 10000 == 0)
            console.log(entries.length)
          if (file_cb)
            file_cb(item)
        })
        .on('end', () => {
          this.files = entries
          resolve(this.files)
        })
        .on('error', reject)
    })
  }

}

ts = new TemplateSet('base')
console.log(ts.files)
ts.waitFiles().then(console.log)

