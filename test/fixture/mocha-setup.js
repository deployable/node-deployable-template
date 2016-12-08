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

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test'
