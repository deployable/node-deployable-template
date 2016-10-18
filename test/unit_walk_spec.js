const Walk = require('../lib/walk')
const path = require('path')
const debug = require('debug')('dply::test::unit::module_template::walk')

describe('unit::module_template::walk', function(){

  let test_dir = path.join(__dirname,'fixture','walk')
  let test_files = [ 'dir', 'dir/anotherfile', 'file' ]
  test_files = [ 'dir/anotherfile', 'file' ]
  let test_file_paths = test_files.map(el => path.join(test_dir,el))

  it('should walks files in fixture dir asynchronously',function(done){
    let errors = []
    Walk.dir(test_dir, errors).then((files)=>{
      expect( files ).to.eql( test_file_paths )
      expect( errors ).to.eql( [] )
      done()
    })

  })

  it('walks files in fixture dir synchronously',function(){
    let errors = []
    let files = Walk.dirSync(test_dir, errors)
    expect( files ).to.eql( test_file_paths )
    expect( errors ).to.eql( [] )
  })

})
