
const app = require('../app')
const request = require('supertest')


describe('int::{{name}}::app', function(){

   describe('requests', function(){

     it('GET / should recieve Hello', function(){
       return request( app ).get('/')
       .then(res => {
         expect(res.text).to.equal('Hello!;)
       })
     })

   })
 
})

