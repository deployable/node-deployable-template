const cli = require('../lib/command_line')
const debug = require('debug')('dply::test::unit::template::cli')
const yargs = require('yargs')
const CliCode = require('../lib/cli_code')
const CliRun = require('../lib/cli_run')
const path = require('path')

describe('unit::template::cli', function(){

  beforeEach(function () {
    yargs.reset()
  })

  it('should output help from code', function(){
    let fn = () => cli('--help')
    return CliCode.run(fn).then(result => {
      expect(result).to.have.property('errors').and.to.eql([])
      expect(result).to.have.property('exit').and.be.true
      expect(result).to.have.property('exit_code').and.equal(0)
      debug('code out', result.stdout)
      let out = result.stdout.join('')
      expect( out ).to.include( '--debug' )
      expect( out ).to.include( '--version' )
      expect( out ).to.include( '--help' )
    })
  })

  it('should output help for build command', function(){
    let fn = () => cli('build --help')
    return CliCode.run(fn).then(result => {
      expect(result).to.have.property('errors').and.to.eql([])
      expect(result).to.have.property('exit').and.be.true
      expect(result).to.have.property('exit_code').and.equal(0)
      debug('code out', result.stdout)
      let out = result.stdout.join('')
      expect( out ).to.include( '--name, -n ' )
      expect( out ).to.include( '--template-path, -p ' )
      expect( out ).to.include( '--output, -o ' )
      expect( out ).to.include( '--replace, -r ' )
      expect( out ).to.include( '--set, -s ' )
      expect( out ).to.include( '--json, -j ' )
      expect( out ).to.include( '--yaml, -y ' )
      expect( out ).to.include( '--file, -f' )
    })
  })

  it('should output help from binary', function(){
    let bin = path.resolve(__dirname,'..','bin','dt')
    return CliRun.run(bin).then(result => {
      expect(result).to.have.property('errors').and.to.eql([])
      expect(result).to.have.property('exit').and.equal(1)
      debug('bin out', result.stdout)
      debug('bin err', result.stderr)
      let err = result.stderr.join('')
      expect( err ).to.include( '--debug' )
      expect( err ).to.include( '--version' )
      expect( err ).to.include( '--help' )
    })
  })

  // it('should default to help', function(){
  //   let cmd = cli('')
  //   expect( cmd ).to.eql( {} )
  // })

  // it('should default to help', function(){
  //   let cmd = cli('build --help')
  //   expect( cmd ).to.eql( {} )
  // })

})
