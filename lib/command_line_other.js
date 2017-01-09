//import * as mustache from 'mustache'

const debug     = require('debug')('dply:template:command_line_other')


module.exports = {

  command: 'other',

  aliases: ['o'],

  desc: 'Other command',

  builder: yargs => {
    return argv = yargs
      .options({
        someopt: { demand: 'someopt'},
        twoopt: { description: 'two option'},
      })
      .example('$0 other -f foo.js', 'Other foo')
  },

  handler: argv => {
    debug('other argv',argv)
  }
  
}