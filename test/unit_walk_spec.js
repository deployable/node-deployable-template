const Walk = require('../lib/walk')
const debug = require('debug')('dply::test::unit::module_template::walk')


describe('unit::module_template::walk', function(){

  let desc_test_dir = path.join(__dirname,'fixture','walk')
  let desc_test_files = [ 'dir', 'dir/anotherfile', 'file' ]
  
  desc_test_files = [ 'dir/anotherfile', 'file' ]
  let desc_test_file_paths = desc_test_files.map(el => path.join(desc_test_dir, el))

  it('should walks files in fixture dir asynchronously',function(done){
    let errors = []
    Walk.dir(desc_test_dir, errors).then((files)=>{
      expect( files ).to.eql( desc_test_file_paths )
      expect( errors ).to.eql( [] )
      done()
    })

  })

  it('walks files in fixture dir synchronously',function(){
    let errors = []
    let files = Walk.dirSync(desc_test_dir, errors)
    expect( files ).to.eql( desc_test_file_paths )
    expect( errors ).to.eql( [] )
  })

})
