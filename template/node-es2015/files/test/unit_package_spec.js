const { Something, VERSION } = require('../')

describe('Unit::{{ name }}', function(){

  describe('require', function(){
  
    it('should load the Something class', function(){
      expect( Something ).to.be.ok
    })

    it('should export a package VERSION', function(){
      expect( VERSION ).to.be.ok
      expect( VERSION ).to.be.a.string
      expect( VERSION ).to.match(/^\d+\.\d+\.\d+/)
    })

  })

})
