const {{ name }} = require('../')

describe('Unit::{{ name }}', function(){

  describe('{{ name }} does something', function(){
  
    it('should do something with module', function(){
      expect( {{ name }}.something ).to.equal( 1 )
    })

  })

})
