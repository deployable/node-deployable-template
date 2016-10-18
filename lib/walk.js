const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const debug = require('debug')('dply::walk')


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

    // `readdir().map` concurrency
    }, { concurrency: 2})

    // Promise recursion produces an array of array entries, flatten them
    .reduce((entries, result) => entries.concat(result), [])
  }

  static dir (dir, errors) {
    debug('Walking dir', dir)
    return Walk.readdir(dir)
    .then( done => {
      debug('Done walking dir', dir, done.length)
      return done
    })
    .catch( err => {
      console.error('error', dir, err)
      if (!errors) throw err
      errors.push(err)
    })
  }


  // Synchronous, lower memory a bit slower.

  static readdirSync (dir) {
    return fs.readdirSync(dir)
    .map( entry => {
      let entry_path = path.join(dir, entry)
      let entry_stat = fs.lstatSync(entry_path)
      if ( entry_stat.isDirectory() )
        return Walk.readdirSync(entry_path)
      else
        return entry_path
    })
    .reduce((entries, result) => entries.concat(result), [])
  }

  static dirSync (dir) {
    debug('Walking dir', dir)
    let done = Walk.readdirSync(dir)
    debug('Done walking dir', dir, done.length)
    return done
  }

}

