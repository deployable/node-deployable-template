const _ = require('lodash')


const Stack = module.exports = class Stack {
  
  static lines (error){
    return error.stack.split('\n')
  }

  static stackLines (lines) {
    return _.filter(lines, line => _.startsWith(line, '    at '))
  }

  static firstLine(call_sites){
    return _.head(call_sites)
  }

  static removeDir(line, dir){
    return line.replace(dir, '')
  }

  static nice( error, remove_dir ){
    let lines = Stack.lines(error)
    let stackLines = Stack.stackLines(lines)
    let firstLine = Stack.firstLine(stackLines)
    return Stack.removeDir(firstLine, remove_dir)
  }

}
