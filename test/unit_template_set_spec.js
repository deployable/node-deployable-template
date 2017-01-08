const TemplateSet = require('../lib/template_set')
const debug = require('debug')('dply:test:unit:template:template_set')

const TestEnv = require('./mocha_helpers_env')


describe('Unit::template::TemplateSet', function(){


  describe('Class creation', function(){

    it('should create an instance of TemplateSet', function(){
      let ts = new TemplateSet('base')
      expect( ts ).to.be.instanceOf( TemplateSet )
    })

  })


  describe('Class instance', function(){

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
      return expect( ts.findTemplateFiles() ).to.eventually.have.length( 1 )
    })

  })


  describe('Templating', function(){

    let ts = null
    let ts_properties = { 
      name: 'mymod_name', 
      description: 'mymod_desc',
      dev_name: 'dname',
      dev_email: 'e@b.c'
    }

    before(function(done) {
      ts = new TemplateSet('base',{properties:ts_properties})
      ts.findTemplateFiles().then(()=> done())
    })

    it('should replace {{properties}} in a template', function(){
      expect(ts.files).to.include('README.md')
      return expect( ts.templateFile(ts.files[0]) )
        .to.become('# mymod_name\n\nThis readme was generated by deployable templates.\n\nThis is a default value\n\n')
    })

  })


  describe('File writing', function(){

    let ts = null

    // Create a temp output dir
    before(function(done){
      TestEnv.mkdirOutputTmpAsync().then( tmpdir => {
        ts = new TemplateSet('base', { output_path: tmpdir, properties: {name:'-File writing name-'} })
        ts.findTemplateFiles().then(()=> done())
      })
    })

    // Clean up our tmp output
    after(function(){
      return TestEnv.cleanOutputTmpAsync()
    })

    it('should write out templates to dir', function(){
      return expect( ts.templateFiles() )
        .to.eventually.have.length( 1 )
    })

  })


  describe('TemplateSet failures', function(){

    it('should error on missing templates', function(){
      let ts = new TemplateSet('nope')
      let template_path = TestEnv.basePath('template', 'nope', 'files')
      return expect( ts.findTemplateFiles() )
        .to.eventually.be.rejectedWith(Error, `No such file or directory "${template_path}"`)
    })

  })


  describe('Main entry', function(){

    after(function(){
      return TestEnv.cleanOutputAsync('gotest')
    })

    it('should go', function(done){
      let properties = { name: 'main_entry_go_test' }
      let options = {
        output_path: TestEnv.tmpOutputPath(),
        properties: properties
      }
      let ts = new TemplateSet('base', options )
      ts.go().then(res => {
        expect( res ).to.be.ok
        expect( res ).to.be.an( 'array' )
        expect( res[0] ).to.match( /\/tmp-\w+\/README.md/ )
        done()
      })
      .catch(done)
    })

  })


  describe('Special . file handling for npm', function(){

    let ts = null
    let ts_properties = {}
    let ts_path = TestEnv.fixturePath()

    before(function(done) {
      ts = new TemplateSet('template_with_.gitignore', { base_path: ts_path, properties: ts_properties })
      ts.findTemplateFiles().then(()=> done())
    })

    it('should replace {{properties}} in a template', function(){
      expect(ts.files).to.include('.dot.gitignore')
      return expect( ts.templateFile(ts.files[0]) )
        .to.become('agitignore\n')
    })

  })


})
  
