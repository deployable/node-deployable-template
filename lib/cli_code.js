
// # CliCode

// Run cli code that would normally do cli things. 
// Capture stdout and protect against `process` events
// This is node `process` voodoo, be warned. It goes horribly
// wrong sometimes, best used in testing only. 

// Based on [yargs `checkOutput`](https://github.com/yargs/yargs/blob/51af0a640ba3df0f86b9ed1dd01ade018af6b279/test/helpers/utils.js)

const Promise = require('bluebird')
const debug = require('debug')('dply::template::cli_code')


module.exports = class CliCode {

  static run( fn, options = {} ){
    options.fn = fn
    let r = new CliCode(options)
    return r.run()
  }

  constructor( options = {} ){
    debug('creating CliCode', options)
    this.function = options.function || options.fn
    if (!this.function) throw new Error('I require a function:')
    this.argv = options.argv || []
    this.stdout = ( options.stdout !== undefined ) ? Boolean(options.stdout) : true
    this.stderr = ( options.stderr !== undefined ) ? Boolean(options.stderr) : true
    
    this.results = {
      return: null,   // returned value from function
      errors: [],     // Any errors picked up
      stdout: [],     // stdout
      stderr: [],     // stderr
      exit: false,    // did process.exit get called?
      exit_code: null // process.exit code
    }

  }


  setup (resolve, reject) {
    debug('running setup')

    // Inject our new argv
    this.process_argv = process.argv
    debug('process.argv', process.argv)
    process.argv = this.argv

    // Don't let the process exit
    this.process_exit = process.exit
    process.exit = (n) => {
      this.results.exit = true
      this.results.exit_code = n
      resolve(this.results)
    }
    debug('process.exit done')

    // Capture errors, promises might do this already
    this.process_emit = process.emit
    process.emit = (ev, value) => {
      if (ev === 'uncaughtException') {
        this.teardown()
        return reject(value)
      }
      return this.process_emit.apply(this.process_emit, arguments)
    }
    debug('process.emit done')


    // // Replace stdout
    if (this.stdout){      
      this.process_stdout_write = process.stdout.write
      process.stdout.write = (chunk, encoding, fd) => {
        let lines = chunk.split('\n')
        this.results.stdout.push(...lines)
      }
    }

    // // Replace stderr
    if (this.stderr) {
      this.process_stderr_write = process.stderr.write
      process.stderr.write = (chunk, encoding, fd) => {
        let lines = chunk.split('\n')
        this.results.stderr.push(...lines)
      }
    }

    debug('done setup')
  }

  // Put it all back the way we foun it. 
  // Needs to always run
  teardown () {
    debug('running teardown')
    if (this.process_stdout_write ) process.stdout.write = this.process_stdout_write 
    if (this.process_stderr_write) process.stderr.write = this.process_stderr_write
    if (this.process_argv) process.argv = this.process_argv
    if (this.process_exit) process.exit = this.process_exit
    if (this.process_emit) process.emit = this.process_emit
  }


  // Run the cli code function
  run () {
    return new Promise((resolve, reject) => {
      this.setup(resolve, reject)
      debug('returned from setup')
      if (!this.process_stdout_write) reject('something wrong with stdout setup')
      if (!this.process_stderr_write) reject('something wrong with stderr setup')
      if (!this.process_argv) reject('something wrong with argv setup')
      if (!this.process_exit) reject('something wrong with exit setup')
      //if (!this.process_emit) reject('something wrong with emit setup')
      this.results.return = this.function()
      resolve(this.results)
      this.teardown()
      return this.results.return
    })
    .catch((e) => {
      this.teardown()
      this.results.errors.push = [e]
      throw e
      return this.results
    })
    .finally(() => this.teardown())
  }

}
