//global.mocha = require('mocha')

global.chai = require('chai')
global.sinon = require('sinon')
global.expect = chai.expect
global.chai.use(require('chai-as-promised'))
global.chai.config.truncateThreshold = 256

const Promise = require('bluebird')
Promise.config({
  longStackTraces: true,
  warnings: true
})

// This might be too far?
global.fs = Promise.promisifyAll(require('fs'))
global.fse = Promise.promisifyAll(require('fs-extra'))


if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test'

