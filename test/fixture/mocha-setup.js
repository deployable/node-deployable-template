global.mocha = require('mocha')
global.chai = require('chai')
global.sinon = require('sinon')
global.expect = chai.expect
global.chai.use(require('chai-as-promised'))
global.chai.config.truncateThreshold = 1024
