const cli = require('../lib/command_line')
const debug = require('debug')('dply::test::integration::template::cli')
const yargs = require('yargs')
const CliCode = require('../lib/cli_code')
const Cli = require('../lib/cli')
const path = require('path')


describe('integration::template::cli', function(){

  
  describe('cli', function(){

    beforeEach(function () {
      yargs.reset()
    })

    it('should output help from code', function(){
      let fn = () => cli( '--help' )
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
      let fn = () => cli( 'build --help' )
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
        expect( out ).to.include( '--file, -f' )
      })
    })

  })


  describe('command', function(){
    
    let bin = path.resolve( __dirname, '..', 'bin', 'dt' )
    
    it('should output help from binary', function(){
      return Cli.run(bin).then(result => {
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

  })

})

