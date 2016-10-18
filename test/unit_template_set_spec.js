const TemplateSet = require('../lib/template_set')
const path = require('path')
const debug = require('debug')('dply::test::unit::module_template::template_set')


describe('unit::module_template::template_set', function(){

  describe('TemplateSet creation', function(){

    it('should create an instance of TemplateSet', function(){
      let ts = new TemplateSet('base')
      expect( ts ).to.be.instanceOf( TemplateSet )
    })

  })


  describe('TemplateSet instance', function(){

    let ts = null

    beforeEach(function() {
      ts = new TemplateSet('base')
    })

    it('should have a base name', function(){
      expect( ts.base_name ).to.equal( 'base' )
    })

    it('should have a base path', function(){
      expect( ts.base_path ).to.match( /\/template$/ )
    })

    it('should eventually populate a set of files', function(){
      return expect( ts.waitForFiles() ).to.eventually.have.length( 8 )
    })

  })

})
