const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const debug = require('debug')('dply::walk')


class Walk {

  // Asynchronous, 50% more memory, non blocking
  // Higher `concurrency` uses more memory, doesn't seem to
  // get much quicker past 2. 
  // Due to the recursion, `concurrency` doesn't really limit to 2.

  static readdir (dir) {
    return fs.readdirAsync(dir).map( entry => {
      let entry_path = path.join(dir, entry)
      return fs.lstatAsync(entry_path).then( stat => {
        // Recurse for a directory, return a file
        if ( stat.isDirectory() ) return Walk.readdir(entry_path)
        return entry_path
      })
    }, { concurrency: 3}) // `.map`
    // Recursion produces array of arrays, flatten them
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
      errors.push(err)
    })
  }


  // Synchronous, lower memory, quicker

  static readdirsync (dir) {
    return fs.readdirSync(dir)
    .map( entry => {
      let entry_path = path.join(dir, entry)
      let entry_stat = fs.lstatSync(entry_path)
      if ( entry_stat.isDirectory() )
        return Walk.readdirsync(entry_path)
      else
        return entry_path
    })
    .reduce((entries, result) => entries.concat(result), [])
  }

  static sync (dir) {
    debug('Walking dir', dir)
    let done = Walk.readdirsync(dir)
    debug('Done walking dir', dir, done.length)
    return done
  }

}


class WalkDirSecond {

  // This avoids storing everything in the resolved promise as that 
  // appears to be super memory hungry. It uses the `files` and `errors`
  // arrays that need to be passed in for that. 
  static walk ( dir, errors ){
    return fs.readdirAsync(dir).map( entry => {
      let entry_path = path.join(dir,entry)
      return fs.lstatAsync(entry_path).then( entry_stat => {
        //debug('push', files.length, process.memoryUsage().heapUsed, entry_path)
        if (!entry_stat.isDirectory()) return entry_path
        //debug('dir', process.memoryUsage().heapUsed, entry_path)
        return WalkDirSecond.walk(entry_path, errors)
      })
    }, {concurrency: 1})
    .each( file => {
      console.log('file', file)
    })
    .then( done => {
      console.log('done')
      return done
    })
    .catch( err => {
      console.error(err)
      errors.push(err)
    })
  }
}

class WalkDirFirst {

  // This avoids storing everything in the resolved promise as that 
  // appears to be super memory hungry. It uses the `files` and `errors`
  // arrays that need to be passed in for that. 
  static walk ( dir, dirs, files, errors ){
    return fs.readdirAsync(dir).then(entries => {
      let dirwalks = []
      for (var i = 0, len = entries.length; i < len; i++) {
        let entry = entries[i]
        let entry_path = path.join(dir,entry)
        dirwalks.push(fs.lstatAsync(entry_path).then( entry_stat => {
          //debug('push', files.length, process.memoryUsage().heapUsed, entry_path)
          files.push(entry_path)
          if (!entry_stat.isDirectory()) {
            return 
          } else {
            dirs.push(true)
            debug('dir', dirs.length, files.length, process.memoryUsage().heapUsed, entry_path)
          }
          return WalkDirFirst.walk(entry_path, dirs, files, errors)
        }))
      }
      return Promise.all(dirwalks)
    }).catch(err => {
      console.error(err)
      errors.push(err)
    })
  }
}


class Nope {
  static waitFiles (files) {
    debug('waitFiles')
    return new Promise((resolve, reject) => {
      if ( files.length > 0 ) return resolve(files)
      return Promise.delay(200).then(() => resolve(WalkDirFirst.waitFiles(files)))
    })
  }
}


class WalkAsync2 {
   
  static path (path) {
    let errors = []
    let entries = []
    return WalkAsync.entry(path, errors, entries).then(()=> { return {errors, entries} })
  }

  static entry (path_entry, entries, errors) {
    return fs.lstatAsync(path_entry).then((stats)=> {
      if (!stats.isDirectory()) return entries.push(path_entry)
      return fs.readdirAsync(path_entry)
    }).then((path_entries) => {
      //debug('dir',path_entry)
      let walk_paths = []
      for (var i = 0, len = path_entries.length; i < len; i++) {
        walk_paths.push(WalkAsync.entry(path.join(path_entry,path_entries[i]), entries, errors))
      }
      console.log(process.memoryUsage().heapUsed, value);
      
      return Promise.all(walk_paths)
    })
    .catch(err => errors.push(err))
  }

}



class WalkAsync {
   
  static path (path) {
    let errors = []
    let entries = []
    let running = {}
    return WalkAsync.entry(path, errors, entries, running).then(()=> { return {errors, entries} })
  }

  static entry (path_entry, entries, errors, running) {
    return fs.lstatAsync(path_entry).then((stats)=> {
      if (!stats.isDirectory()) return entries.push(path_entry)
      running[next] = path_entry
      return fs.readdirAsync(path_entry).then((path_entries) => {
        debug('dir',process.memoryUsage().heapUsed,path_entry, running)
        let walk_paths = []
        for (var i = 0, len = path_entries.length; i < len; i++) {
          let next = path_entries[i]
          WalkAsync.entry(path.join(path_entry, next), entries, errors, running)
        }
      })
      .then(res => {
        delete running[next]
      })
      .catch(err => errors.push(err))
    })
    .catch(err => errors.push(err))
  }

}


class WalkCb {

  static walk (entry, entries, errors, done) {
    let paths = [entry]

    fs.lstat(entry, function (err, stats) {
      if (err) return errors.push({err, entry})
      paths.push(entry)
      if (!stats.isDirectory()) {
        return done(null)
      }
      debug('walkcb dir', entry)
      fs.readdir(entry, function (err, path_entries) {
        if (err) return errors.push({err, entry})
        for (var i = 0, len = path_entries.length; i < len; i++) {
          WalkCb.walk(path_entries[i], entries, errors, ()=>{
            console.log('done', path_entries[i])
          })
        }
      })
    })
  }

}  

the_path = '/Users/matt/clones/'

// WalkCb.walk(the_path, [], [], ()=> console.log('done'))

// WalkAsync.path(the_path).then(res => {
//   console.log(res.errors, res.entries)
//   return WalkAsync2.path(the_path)
// }).then(res => {
//   console.log(res.errors, res.entries)
// })

// let dirs = []
// let files = []
// let errors = []
// WalkDirFirst.walk(the_path, dirs, files, errors).then(()=>{
//   console.log(files)
//   if ( errors.length > 0 ) console.error(errors)
// })

let errorss = []
files = Walk.sync(the_path, errorss)
//console.log(files)
if ( errorss.length > 0 ) console.error(errorss)
files = []

let errorsd = []
Walk.dir(the_path, errorsd).then((files)=>{
  //console.log(files)
  if ( errorsd.length > 0 ) console.error(errorsd)
})



