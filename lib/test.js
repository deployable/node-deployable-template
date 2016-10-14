const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const debug = require('debug')('walk')

let value = 0


function immediate () {
  return new Promise(function(resolve) {
    setImmediate(resolve)
  })
}


function lstat (entry) {
  return new Promise(function(resolve,reject) {
    fs.lstat(entry, function(err,res){
      if (err) return reject(err)
      resolve(res)
    })
  })
}

function readdir (entry) {
  return new Promise(function(resolve,reject) {
    fs.readdir(entry, function(err,res){
      if (err) return reject(err)
      resolve(res)
    })
  })
}

function readdirStore (entry) {
  return readdir(entry).then(entries => {
    let dir_entries = []
    for (var i = 0, len = entries.length; i < len; i++) {
      dir_entries.push( path.join(entry, entries[i]))
    }
    return dir_entries
  })
}

function loop (entry, store) {
  value += 1
  return lstat(entry).then(function(stat) {
    debug(entry)
    store.push(entry)
    if ( ! stat.isDirectory() ) return []
    if (value % 200000 == 0) {
      console.log(process.memoryUsage().heapUsed, value)
    }
    return readdirStore(entry)
  }).then( entries => {
    loops = []
    for (var i = 0, len = entries.length; i < len; i++) {
      loops.push( loop( entries[i], store ) )
    }
    return Promise.all(loops)
  })
}

let files = []
loop('/Users/matt/clones',files).then(end => {
  console.log('files',files)
})
