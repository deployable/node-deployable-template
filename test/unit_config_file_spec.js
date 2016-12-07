
const {ConfigFile, ConfigFileError} = require('../lib/config_file')
const debug = require('debug')('dply::test::unit::template::config_file')


describe('unit::template::config_file', function(){

  let desc_test_dir = path.join(__dirname, 'fixture')
  debug('desc_test_dir', desc_test_dir)

  it('should load ConfigFile', function(){
    expect( ConfigFile ).to.be.ok
  })
  
  it('should load ConfigFileError', function(){
    expect( ConfigFileError ).to.be.ok
  })

  it('should load a config file', function(){
    let file = path.join(desc_test_dir, 'config.plain')
    let cf = new ConfigFile(file)
    expect( cf ).to.be.an.instanceOf( ConfigFile )
  })

  it('should load a config file', function(){
    let file = path.join(desc_test_dir, 'config.plain')
    let cf = new ConfigFile(file)
    expect( cf ).to.be.an.instanceOf( ConfigFile )
  })


  describe('property defaults', function(){

    let cf = null
    let file = null
    let desc_test_dir = path.join(__dirname, 'fixture')

    before(function(){
      file = path.join(desc_test_dir, 'config.plain')
      cf = new ConfigFile(file)
    })

    it('should have a key_prefix', function(){
      expect( cf ).to.be.have.property( 'key_prefix' ).and.equal( '' )
    })

    it('should have a key_re', function(){
      expect( cf ).to.be.have.property( 'key_re' ).and.eql( /[\w-]+?/ )
    })

    it('should have a key_prefix', function(){
      expect( cf ).to.be.have.property( 'key_suffix' ).and.equal( '' )
    })

    it('should have a seperator_prefix', function(){
      expect( cf ).to.be.have.property( 'seperator_prefix' ).and.equal( ' ' )
    })

    it('should have a seperator', function(){
      expect( cf ).to.be.have.property( 'seperator' ).and.equal( '=' )
    })

    it('should have a seperator_suffix', function(){
      expect( cf ).to.be.have.property( 'seperator_suffix' ).and.equal( ' ' )
    })

    it('should have a value_prefix', function(){
      expect( cf ).to.be.have.property( 'value_prefix' ).and.equal( '' )
    })

    it('should have a value_re', function(){
      expect( cf ).to.be.have.property( 'value_re' ).and.eql( /.+?/ )
    })

    it('should have a value_suffix', function(){
      expect( cf ).to.be.have.property( 'value_suffix' ).and.equal( '' )
    })

    it('should build a config_line_re', function(){
      expect( cf ).to.be.have.property( 'config_line_re' ).and.be.a( 'regexp' )
      expect( cf.config_line_re ).to.eql( /^(s*)([\w-]+?) = (.+?)(.+)$/ )
    })

    it('should set a surround_key', function(){
      cf.surround_key = ':-:'
      expect( cf.key_prefix ).to.eql( ':-:')
      expect( cf.key_suffix ).to.eql( ':-:')
    })

    it('should set a surround_seperator', function(){
      cf.surround_seperator = '-_-'
      expect( cf.seperator_prefix ).to.eql('-_-')
      expect( cf.seperator_suffix ).to.eql('-_-')
    })

    it('should set a surround_value', function(){
      cf.surround_value = 'o_o'
      expect( cf.value_prefix ).to.eql( 'o_o' )
      expect( cf.value_suffix ).to.eql( 'o_o' )
    })
  })


  describe('generate', function(){

    let cf = null

    beforeEach(function(){
      cf = new ConfigFile()
    })

    it('should generate config with space equals',function(){
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( 'test = val' )
    })

    it('should generate config with equals quotes',function(){
      cf.surround_seperator = ''
      cf.surround_value = '"'
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( 'test="val"' )
    })

    it('should generate config with colon space',function(){
      cf.seperator_prefix = ''
      cf.seperator = ':'
      cf.seperator_suffix = ' '
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( 'test: val' )
    })

    it('should generate yaml config ',function(){
      cf.modeYaml()
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( 'test: val\n' )
    })

    it('should generate json config ',function(){
      cf.modeJSON()
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( '{"test":"val"}' )
    })

    it('should generate ini config ',function(){
      cf.modeIni()
      cf.set('test','val')
      expect( cf.generateFile() ).to.eql( 'test=val' )
    })

    it('should generate ini config ',function(){
      cf.modeIni()
      cf.set('atest','val1')
      cf.set('test.yep','val2')
      expect( cf.generateFile() ).to.eql( 'atest=val1\n[test]\nyep=val2\n' )
    })

  })


  describe('write', function(){

    let desc_test_dir = path.join(__dirname, 'fixture')

    it('should write a config file', function(){
      let file = path.join(desc_test_dir, 'config.out')
      let cf = new ConfigFile({ path: file })
      let write = cf.writeFile()
      expect( write ).to.become(true)
      return write
    })

  })

})

