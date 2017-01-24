// # TestEnv

// Test environment
// Standard things that all the tests might use

// `fixturePath()`

// `outputPath()`

// `basePath()`

// Setting `DEBUG_CLEAN=true mocha` does't clean up files. Lets you look at them after a test

const Promise = require('bluebird')
const path = require('path')
const crypto = require('crypto')
const fse = Promise.promisifyAll(require('fs-extra'))
const debug = require('debug')('dply:test:helpers:test_env')


const TestEnv = module.exports = class TestEnv {

  static init () {

    // The app base bath
    // This only works when the file is put in the `test/` dir.
    // If this becomes a node_module it's probably best to get the 
    // user to pass it on on `init` or move to class `new`
    this.base_path = path.resolve(__dirname, '..')
    
    // Fixtures in test
    this.fixture_dir = 'fixture'
    this.fixture_path = path.join(__dirname, 'fixture')
    
    // Output in test
    this.output_dir = 'output'
    this.output_path = path.join(__dirname, 'output')
    
    // a tmp- dir in outpu
    this.tmp_output_dir_prefix = 'tmp-'
    
    this.path = path
    this.fse = fse
  }

  static join (...args) { path.join(...args) }

  // Return a dir from base dir
  static basePath(...args) {
    return path.join(this.base_path, ...args)
  }

  // Return the fixture dir
  static fixturePath(...args){
    return path.join(this.fixture_path, ...args)
  }

  // Return the output dir
  static outputPath(...args){
    return path.join(this.output_path, ...args)
  }

  // create a `tmp-<something>` dir in output
  static tmpOutputPath(suffix){
    if (!suffix) suffix = this.randomHex(5)
    return this.outputPath( this.tmp_output_dir_prefix + suffix )
  }

  // `randomHex(6)`
  static randomHex(n){
    let bytes = Math.ceil(n/2)
    return crypto.randomBytes(bytes).toString('hex').slice(0,n)
  }

  // `clean(dir)`
  // `clean(outside_dir, force: true)`
  static clean(...args){ return this.cleanAsync(...args) }
  static cleanAsync(dir, options = {}){
    if (!dir) throw new Error('TestEnvError: No dir to clean')
    if (typeof dir !== 'string') throw new Error(`TestEnvError: directory must be a string. ${typeof dir}`)

    // Be careful when deleting paths
    let base_path = this.basePath()
    if ( !dir.startsWith(base_path) && !options.force ) {
      throw new Error(`TestEnvError: Can't clean outside of project without "force:true" option: ${dir}`)
    }

    // The environment variable `DEBUG_CLEAN` will turn off deletions
    if (process.env.DEBUG_CLEAN) {
      debug('debug would have cleaned up dir "%s"', dir)
      return Promise.resolve(dir)
    }

    // Now the actual remove. `rm -rf` equivelant
    debug('cleaning up dir "%s"', dir)
    return fse.removeAsync(dir).then(res => {
      debug('cleaned dir "%s"', dir)
      return res
    })
  }

  static cleanAllOutputAsync(){
    let dir = this.outputPath()
    debug('emptying ouput dir', dir)
    return fse.emptyDir(this.outputPath(dir))
  }

  static cleanOutputAsync(subdir){
    if (!subdir) throw new Error('TestEnvError: No subdir to clean')
    debug('cleaning up output dir "%s"', subdir)
    return this.clean( this.outputPath(subdir) )
  }

  static cleanAllOutputTmpAsync(){
    return new Promise((resolve, reject) => {
      let output_dir = this.outputPath()
      let tmp_prefix = this.tmp_output_dir_prefix
      debug('cleaning all output tmp- directories dir', output_dir, tmp_prefix)

      var items = [] // files, directories, symlinks, etc

      fse.walk(output_dir)
        .on('readable', function () {
          var item
          while ( (item = this.read()) ) {
            if ( item.startsWith(tmp_prefix) ) items.push(item.path)
          }
        })
        .on('end', function () {
          console.dir(items) // => [ ... array of files]
          resolve(items)
        })
    })
  }
  
  static cleanOutputTmpAsync(suffix){
    let dir = this.tmpOutputPath(suffix)
    debug('cleaning up tmp dir', dir)
    return this.clean( this.outputPath(dir) )
  }

  static mkdirOutputAsync(...args){
    let out_dir = this.outputPath(...args)
    return fse.mkdirsAsync(out_dir)
  }

  static mkdirOutputTmpAsync(suffix){
    let out_dir = this.tmpOutputPath(suffix)
    return fse.mkdirsAsync(out_dir)
  }


  // ## Instance

  constructor( base_path ) {
    this.base_path = base_path
    this.test_dir = options.test_dir || 'test'
    this.fixture_dir = options.fixture_dir || 'fixture'
    this.output_dir = options.output_dir || 'output'
  }

  // Return the fixture dir
  get test_path(){
    return path.join(this.base_path, this.test_dir)
  }

  // Return the fixture dir
  get fixture_path(){
    return path.join(this.base_path, this.test_dir, this.fixture_dir, ...args)
  }

  // Return the output dir
  get output_path(){
    return path.join(this.base_path, this.test_dir, this.output_dir, ...args)
  }

}

// Attach class data due to es2015 class limitation
TestEnv.init()
