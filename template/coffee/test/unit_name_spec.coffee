debug = require('debug') 'dply::{{ module }}'
library = require '../lib/'


describe 'unit::{{ module }}', ->


  describe 'Some module trait', ->
  
    it 'should do something with module', ->
      expect( module.something ).to.equal 1


  describe 'Some other trait', ->
  
    it 'should be right', ->
      expect( module.right ).to.be.ok

