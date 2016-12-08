// # TestEnv

// Test environment
// Standard things that all the tests might use

// Setting `DEBUG_CLEAN=true mocha` does't clean up files. Lets you look at them after a test

const path = require('path')
const crypto = require('crypto')
const fs = require('fs-extra')
const debug = require('debug')('dply::test::helpers::test_env')


const TestEnv = module.exports = class TestEnv {

  static join () { path.join(arguments) }

  static init () {

    // That app base
    this.base_dir = path.resolve(__dirname, '..')
    
    // Fixtures in test
    this.fixture_dir = path.join(__dirname, 'fixture')
    
    // Output in test
    this.output_dir = path.join(__dirname, 'output')
    
    // a tmp- dir in outpu
    this.tmp_output_dir_prefix = 'tmp-'
    
    this.path = path
    this.fs = fs
  }

  // Return a dir from base dir
  static base_path(...args){
    return path.join(this.base_dir, ...args)
  }

  // Return the fixture dir
  static fixture_path(...args){
    return path.join(this.fixture_dir, ...args)
  }

  // Return the output dir
  static output_path(...args){
    return path.join(this.output_dir, ...args)
  }

  // create a `tmp-<something>` dir in output
  static tmp_output_dir(suffix){
    if (!suffix) suffix = this.random(5)
    return this.output_path( this.tmp_output_dir_prefix + suffix )
  }

  // return a random base36 string
  static random(n){
    return crypto.randomBytes(n).toString('hex').slice(0,n)
  }

  static clean(dir){
    if (!dir) throw new Error('TestEnvError: No dir to clean')
    if (process.env.DEBUG_CLEAN) return true
    debug('cleaning up dir', dir)
    return fs.removeAsync(dir)
  }

  static clean_output(subdir){
    if (!subdir) throw new Error('TestEnvError: No subdir to clean')
    return this.clean( this.output_path(subdir) )
  }

}

// Attach class data due to es2015 class limitation
TestEnv.init()
