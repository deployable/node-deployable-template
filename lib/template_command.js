
const debug     = require('debug')('dply:template:template_command')
const Promise   = require('bluebird')


module.exports = class TemplateCommand {

  constructor ( name, options = {} ) {
    debug('name', name, options)
  }

  promiseMe (){
    return Promise.resolve(true)
  }

}
