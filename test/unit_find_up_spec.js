const FindUp = require('../lib/find_up')
const debug = require('debug')('dply::test::unit::module_template::find_up')


describe('unit::module_template::find_up', function(){

  let desc_test_dir = path.join(__dirname, 'fixture', 'findup')
  let desc_test_extra_dir = path.join(desc_test_dir, 'one', 'two')
  debug('desc_test_dir', desc_test_dir) 
  
  it('should find up a package.json', function(){
    let file = 'package.json'
    let expected = path.join(desc_test_dir, file)
    return expect( FindUp.dir(desc_test_extra_dir, file) )
      .to.eventually.equal( expected )
  })

  it('should return null on missing file', function(){
    let file = 'jTTRdYXoIVV4kW.mL6QCVlReO5znCPX1CaX1fOZN33M8$'
    return expect( FindUp.dir(desc_test_dir, file) )
      .to.eventually.be.null
  })

  it('should fail on missing dir', function(){
    return expect( FindUp.dir(desc_test_dir+'no', 'a') )
      .to.be.rejectedWith(Error)
  })

  it('should find up a package.json synchronously',function(){
    let file = 'package.json'
    let expected = path.join(desc_test_dir, file)
    expect( FindUp.dirSync(desc_test_extra_dir, file) ).to.equal( expected )
  })

})
