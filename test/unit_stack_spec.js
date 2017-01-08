const debug = require('debug')('dply:test:unit:template:stack')
const TestEnv = require('./mocha_helpers_env')
const Stack = require('../lib/stack')

function originalError(){
  return new Error('original')
}

describe('unit::template::stack', function(){

  let base_path = TestEnv.basePath()

  it('should process a stack trace', function(){
    debug('base_path', base_path)
    let err = new Error('message')
    expect( Stack.nice(err, base_path) ).to.match( /   at Context.<anonymous> \(test\/unit_stack_spec.js:\d+:\d+\)/ )
  })

  it('should deal with an error with new lines in the message', function(){
    let err = new Error("message 1\nmessage 2")
    expect( Stack.nice(err, base_path) ).to.contain( '   at Context.<anonymous> (test/unit_stack_spec.js:'  )
  })

  it('should use the original error if it exists', function(){
    let err_ori = originalError()
    let err = new Error('message')
    err.original = err_ori
    expect( Stack.nice(err, base_path) ).to.contain( '   at originalError (test/unit_stack_spec.js:' )
  })

  it('will ignore an empty directory', function(){
    let err = new Error('message')
    expect( Stack.nice(err) ).to.contain(`   at Context.<anonymous> (${base_path}/test/unit_stack_spec.js:`)
  })

  it('will fail on a non string directory', function(){
    let err = new Error('message')
    fn = ()=> Stack.nice(err, {})
    expect( fn ).to.throw( Error, /must be a string - object/ )
  })

})
