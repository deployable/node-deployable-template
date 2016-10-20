global.mocha = require('mocha')
global.chai = require('chai')
global.sinon = require('sinon')
global.expect = chai.expect
global.chai.use(require('chai-as-promised'))
global.chai.config.truncateThreshold = 256
global.path = require('path')
global.os = require('os')
const Promise = require('bluebird')
global.fs = Promise.promisifyAll(require('fs'))
global.fse = Promise.promisifyAll(require('fs-extra'))

Promise.config({
  longStackTraces: true,
  warnings: true
})
