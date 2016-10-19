const TemplateSet = require('../lib/template_set')
const Promise = require('bluebird')
const path = require('path')
const debug = require('debug')('dply::test::unit::module_template::template_set')
const os = require('os')
const fs = Promise.promisifyAll(require('fs'))


describe('unit::module_template::template_set', function(){

  let desc_fixture_dir = path.join(__dirname, 'fixture')
  let desc_output_dir = path.join(__dirname, 'output')
  let desc_tmpoutput_dir_prefix = path.join(desc_output_dir, 'tmp-')


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
      this.slow(20)
      //return expect( ts.findFiles().then(f=>{console.log(f);return f}) ).to.eventually.have.length( 8 )
      return expect( ts.findFiles() ).to.eventually.have.length( 8 )
    })

  })


  describe('TemplateSet writing', function(){

    let desc_temp_output_dir = null
    let ts = null

    before(function(done){
      fs.mkdtempAsync(desc_tmpoutput_dir_prefix).then( tmpdir => {
        ts = new TemplateSet('base', { output_path: tmpdir })
        ts.findFiles().then(()=> done())
      })
    })

    it('should write out templates to dir', function(){
      return expect( ts.templateFiles() )
        .to.eventually.have.length( 8 )
    })

  })


  describe('TemplateSet failures', function(){

    it('should error on missing templates', function(){
      let ts = new TemplateSet('nope')
      let template_path = path.resolve( __dirname, '..', 'template', 'nope' )
      return expect( ts.findFiles() )
        .to.eventually.be.rejectedWith(Error, `No such file or directory "${template_path}"`);
    })

  })


})
  