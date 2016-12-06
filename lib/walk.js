
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const debug = require('debug')('dply::walk')
const {_escapeRegExp} = require('lodash')


module.exports = class Walk {

  // Asynchronous, 50% more memory, non blocking
  // Higher `concurrency` uses more memory, doesn't seem to
  // get much quicker past 2. 
  // Due to the recursion, `concurrency` doesn't really limit to 2.

  // Read the directory and loop over the entries 
  // Recurse on directories, return a value on anything else.

  static readdir (dir) {
    return fs.readdirAsync(dir).map( entry => {
      let entry_path = path.join(dir, entry)
      // `stat` the entry
      return fs.lstatAsync(entry_path).then( stat => {
        // Recurse for a directory, return a file
        if ( stat.isDirectory() ) return Walk.readdir(entry_path)
        return entry_path
      })

    // `readdirAsync().map` concurrency
    }, { concurrency: 2})

    // Promise recursion produces an array of array entries, flatten them
    .reduce((entries, result) => entries.concat(result), [])
  }

  // Async dir walk
  static dir (dir) {
    debug('Walking dir', dir)
    return Walk.readdir(dir)
    .then( done => {
      debug('Done walking dir', dir, (done && done.length) ? done.length : done )
      return done
    })
  }

  // Promise to find the files and throw a nice error
  static findFiles (dir) {
    return Walk.dir(dir)
    .catch({code: 'ENOENT'}, error => {
      error.message = `No such file or directory "${error.path}"`
      error.simple = `Failed to read templates for "${this.base_name}"`
      throw error
    })
  }


  // Synchronous, lower memory a bit slower.

  // Synchronous dir read
  static readdirSync (dir) {
    return fs.readdirSync(dir)
    .map( entry => {
      let entry_path = path.join(dir, entry)
      let entry_stat = fs.lstatSync(entry_path)
      if ( entry_stat.isDirectory() ) return Walk.readdirSync(entry_path)
      return entry_path
    })
    .reduce((entries, result) => entries.concat(result), [])
  }

  // Synchronous dir walk
  static dirSync (dir) {
    debug('Walking dir', dir)
    let done = Walk.readdirSync(dir)
    debug('Done walking dir', dir, done.length)
    return done
  }


  // ## Helpers

  // Remove the base path from any paths in the files array
  static stripPrefixFromPaths( files, dir ){
    let base_path = path.join(dir) + path.sep
    let re_base_path = new RegExp(`^${_escapeRegExp(base_path)}`)
    return files.map( item => item.replace(re_base_path,'') )
  }

}
