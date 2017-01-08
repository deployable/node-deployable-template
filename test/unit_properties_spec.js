const debug = require('debug')('dply:test:unit:template:properties')
const TestEnv = require('./mocha_helpers_env')
const Properties = require('../lib/properties')
const PropertiesError = require('../lib/properties').PropertiesError


describe('unit::template::properties', function(){

  let json_file = TestEnv.fixturePath('properties','properties.json')
  let yaml_file = TestEnv.fixturePath('properties','properties.yaml')
  let bad_file = TestEnv.fixturePath('properties','properties.bad')

  it('should load a json properties file', function(){
    debug('json_file', json_file)
    expect( Properties.fileToDataSync(json_file) ).to.eql({ one:1, two: 2 })
  })

  it('should load a json properties file asynchronously', function(done){
    debug('json_file', json_file)
    Properties.fileToData(json_file).then(result => {
      expect( result ).to.eql({ one:1, two: 2 })
      done()
    })
  })

  it('should load a yaml properties file', function(){
    debug('yaml_file', yaml_file)
    expect( Properties.fileToDataSync(yaml_file) ).to.eql({ one:1, two: 2 })
  })

  it('should fail to load an unkown file', function(){
    debug('bad_file', bad_file)
    fn = () => Properties.fileToDataSync(bad_file)
    expect( fn ).to.throw( Error, /Couldn't load data as JSON or YAML/)
  })

})
