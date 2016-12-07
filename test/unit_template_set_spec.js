const TemplateSet = require('../lib/template_set')
const debug = require('debug')('dply::test::unit::template::template_set')


describe('Unit::template::TemplateSet', function(){

  let desc_fixture_dir = path.join(__dirname, 'fixture')
  let desc_output_dir = path.join(__dirname, 'output')
  let desc_tmpoutput_dir_prefix = path.join(desc_output_dir, 'tmp-')


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

    let desc_temp_output_dir = null
    let ts = null

    // Create a temp output dir
    before(function(done){
      fs.mkdtempAsync(desc_tmpoutput_dir_prefix).then( tmpdir => {
        desc_temp_output_dir = tmpdir
        ts = new TemplateSet('base', { output_path: tmpdir, properties: {name:'-File writing name-'} })
        ts.findTemplateFiles().then(()=> done())
      })
    })

    it('should write out templates to dir', function(){
      return expect( ts.templateFiles() )
        .to.eventually.have.length( 1 )
    })

    // Clean up our tmp output
    after(function(done){
      fse.removeAsync(desc_temp_output_dir).then(done)
    })

  })


  describe('TemplateSet failures', function(){

    it('should error on missing templates', function(){
      let ts = new TemplateSet('nope')
      let template_path = path.resolve( __dirname, '..', 'template', 'nope', 'files')
      return expect( ts.findTemplateFiles() )
        .to.eventually.be.rejectedWith(Error, `No such file or directory "${template_path}"`)
    })

  })


})
  