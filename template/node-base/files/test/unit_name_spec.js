import {{ name }} from '../{{ name }}'

describe('Unit::{{ module }}', function(){

  describe('{{ something }}', function(){
  
    it('should do something with module', function(){
      expect( module.something ).to.equal( 1 )
    })

  })

})
