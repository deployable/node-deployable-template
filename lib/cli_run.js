
// # CliRun

// Run cli code that would normally do cli things. 
// Capture stdout and protect against `process` events
// This is node `process` voodoo, be warned.

// Based on [yargs `checkOutput`](https://github.com/yargs/yargs/blob/51af0a640ba3df0f86b9ed1dd01ade018af6b279/test/helpers/utils.js)

const Promise = require('bluebird')
const debug = require('debug')('dply::template::cli_code')
const spawn = require('child_process').spawn



module.exports = class CliRun {

  static run( fn, options = {} ){
    let r = new CliRun(fn, options)
    return r.run()
  }

  constructor( command, options = {} ){
    debug('creating CliRun', command)
    if (typeof command === 'array'){
      this.command = command[0]
      this.args = command.slice(2)
    } else {
      this.command = String(command)
    }

    if (!this.command) throw new Error('I require a command:')
    
    this.args  = options.args
    this.cwd   = options.cwd
    this.env   = options.env
    this.argv0 = options.process_name || options.argv0
    this.shell = options.shell || false

    this.results = {
      errors: [],     // Any errors picked up
      stdout: [],     // stdout
      stderr: [],     // stderr
      exit: null      // process.exit code
    }

  }


  spawnOpts(){
    return {
      cwd: this.cwd,
      env: this.env,
      argv0: this.argv0,
      shell: this.shell
    }
  }

  setup (resolve, reject) {
    debug('running setup')
    debug('done setup')
  }

  // Put it all back the way we found it. 
  // Needs to always run, is probably run too much but ¯\_(ツ)_/¯
  teardown () {
    debug('running teardown')
    debug('done teardown')
  }


  // Run the cli code function
  run () {
    return new Promise((resolve, reject) => {

      this.setup(resolve, reject)

      let res = this.results
      let proc = this.proc = spawn(this.command, this.args, this.spawnOpts())
      
      proc.stdout.on('data', (chunk) => {
        res.stdout.push(...chunk.toString().split('\n')) 
        if (this.stdout_cb) this.stdout_cb(chunk)
      })
      
      proc.stderr.on('data', (chunk) => {
        res.stderr.push(...chunk.toString().split('\n'))
        if (this.stderr_cb) this.stderr_cb(chunk)
      })

      proc.on('close', (code) => {
        res.exit = code 
        resolve(res)
        this.teardown()
      })

    })
    .catch((e) => {
      this.teardown()
      throw e
    })
    // and some excessive teardown
    .finally(() => this.teardown())
  }

}