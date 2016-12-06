import {{ name }} from '../{{ name }}'

describe('Int::{{ name }}', function(){

  describe('Some section', function(){
  
    it('should do something with module', function(){
      expect( {{ module }}.something ).to.equal( 1 )
    })

  })

})
