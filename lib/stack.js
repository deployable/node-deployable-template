const _ = require('lodash')
const path = require('path')


module.exports = class Stack {
  
  static lines (error){
    if ( error.original && error.original.stack ) return error.original.stack.split('\n')
    return error.stack.split('\n')
  }

  static stackLines (lines) {
    return _.filter(lines, line => _.startsWith(line, '    at '))
  }

  static firstLine(call_sites){
    return _.head(call_sites)
  }

  static removeDir(line, dir){
    if ( _.isNil(dir) ) return line
    if ( ! _.isString(dir) ) {
      throw new Error(`Directory to remove must be a string - ${typeof dir}`)
    }
    if ( ! dir.endsWith(path.sep) ) dir += path.sep
    return line.replace(dir, '')
  }

  static nice( error, remove_dir ){
    let lines = Stack.lines(error)
    let stackLines = Stack.stackLines(lines)
    let firstLine = Stack.firstLine(stackLines)
    return Stack.removeDir(firstLine, remove_dir)
  }

}
