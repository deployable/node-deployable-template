
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const debug = require('debug')('dply:find_up')


module.exports = class FindUp {

  // Asynchronous, 50% more memory, non blocking
  // Higher `concurrency` uses more memory, doesn't seem to
  // get much quicker past 2. 
  // Due to the recursion, `concurrency` doesn't really limit to 2.

  // Read the directory and loop over the entries 
  // Recurse on directories, return a value on anything else.

  static readdir (dir, filename) {
    let this_file = path.join(dir,filename)
    return fs.statAsync(this_file).then(stat =>{
        debug('Found file', this_file, stat)
        return this_file
      })
      .catch({code:'ENOENT'}, error => {
        debug('enoent',dir, filename, error.path)
        let parent_dir = path.dirname(dir)
        if (parent_dir === dir) return null
        return FindUp.readdir(parent_dir, filename)
      })

  }

  static dir (dir, filename) {
    debug('Walking up dir "%s" for file "%s"', dir, filename)
    return fs.statAsync(dir).then(() => FindUp.readdir(dir, filename))
  }


  // Synchronous, lower memory a bit slower.

  static readdirSync (dir, filename) {
    if (!dir) throw new Error('Directory required')
    if (!filename) throw new Error('File name required')
    let this_file = path.join(dir, filename)
    try {
      let stat = fs.statSync(this_file)
      debug('found file',this_file, stat)
      return this_file
    } catch (err) {
      if (err.code === 'ENOENT') {
        let parent_dir = path.dirname(dir)
        if (parent_dir === dir) return null
        return FindUp.readdirSync(parent_dir, filename)
      }
      throw err
    }
  }

  static dirSync (dir, filename) {
    debug('Walking up dir "%s" for file "%s"', dir, filename)
    let file_path = FindUp.readdirSync(dir, filename)
    debug('Done walking up dir', dir, filename, file_path)
    return file_path
  }

}
