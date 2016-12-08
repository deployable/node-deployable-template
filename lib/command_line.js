//import * as mustache from 'mustache'

const debug     = require('debug')('dply::template::command_line')
const yargs  = require('yargs')


module.exports = function( argv ){

  debug('dmod command running', argv)

  return yargs(argv)
    .usage('Usage: $0 <command> [opts]')
    .env('DT_')

    // Build Command
    .command(require('./command_line_build'))

    // Command Help
    //.command(require('./command_line_help'))
    
    // Other Command
    .command(require('./command_line_other'))

    // Global options
    .describe('debug', 'Debug output')
    .alias('debug', 'd')
    .global('debug')
    .boolean('debug')
    .group('debug', 'Global Options:')

    .describe('version', 'Show app version')
    .alias('version', 'v')
    .group('version', 'Global Options:')
    .version()
    
    .describe('help', 'Show help')
    .alias('help', 'h')
    .group('help', 'Global Options:')
    .help()

    .demand(1, 'Must provide a valid command')
    .strict()

    .fail((msg, error, yargs) => {
      if ( msg.match(/^Unknown arguments:/) ) {
        yargs.showHelp()
        process.exit(1)
      }
      if ( yargs.debug || process.env.DEBUG ) console.error('DEBUG: %s', error.stack)
      console.error('Template command failed:', msg)
      if ( error && error.description ) console.error(' %s', error.description)
      process.exit(1)
    })

    .epilog('Run `$0 <command> -h` for specific command help\nCopyright 2016')
    .argv

  //debug('global argv',argv)

}
