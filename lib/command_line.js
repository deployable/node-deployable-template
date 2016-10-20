//import * as mustache from 'mustache'

const debug     = require('debug')('dply::module-template')
const yargs  = require('yargs')

debug('dmod command running')

yargs
  .usage('Usage: $0 <command> [opts]')
  .env('DMOD_')

  // Build Command
  .command(require('./command_line_build'))

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
  .epilog('Run `$0 <command> -h` for specific command help\nCopyright 2016')
  .argv

//debug('global argv',argv)
