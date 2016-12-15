//import * as mustache from 'mustache'

const debug     = require('debug')('dply::module-template::command_line_help')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')


module.exports = {

  command: 'help <command>',
  
  aliases: 'h',
  
  desc: 'Display command help',
  
  builder: yargs => {
    return yargs
    .usage('Usage: $0 help <command>')
    .example('$0 help build ', ' Shows build help')
  },
  
  handler: argv => {
    debug('help argv',argv)
    console.log('make this run <command> --help')
  }
  
}

