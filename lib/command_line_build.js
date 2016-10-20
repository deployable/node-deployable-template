//import * as mustache from 'mustache'

const debug     = require('debug')('dply::module-template::command_line_build')
const TemplateSet = require('./template_set')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')


module.exports = {

  command: 'build <name>',
  
  aliases: 'b',
  
  desc: 'Build a new project',
  
  builder: yargs => {
    return yargs
    .usage('Usage: $0 build <name>')
    .options({

      template: {
        alias: 't',
        describe: 'Template set to build from',
        default: 'base'
      },

      'template-path': {
        alias:  'p',
        describe: 'Custom path to template sets',
      },

      output: {
        alias: 'o',
        describe: 'Output Directory',
        //default: [undefined, './{name}'])
      },

      replace: {
        alias: 'r',
        describe: 'Replace existing output',
        default: false,
        type: 'boolean'
      },

      // remove: {
      //   describe: 'Remove existing output',
      //   default: false,
      //   type: 'boolean'
      // },

      set: {
        alias: 's',
        describe: 'Set a template property',
      },

      json: {
        alias: 'j',
        describe: 'JSON template properties',
        coerce: data => {
          debug('json data', data)
          try {
            return JSON.parse(data)
          } catch (err){
            console.error('Failed to parse --json argument:', err.message)
            console.error('', data)
            process.exit(1)
          }
        }
      },

      file: {
        alias: ['f','fi'],
        describe: 'Read template properties from a file',
        coerce: name => {
          try {
            debug('name', name)
            let require_path = path.resolve(name)
            debug('about to read json file', require_path, typeof require_path)
            data = JSON.parse(fs.readFileSync(require_path, 'utf-8'))
            debug('got json', data)
            return data
          } catch (err) {
            console.error(`Failed to load --file "${name}":`, err.message)
            process.exit(1)
          }
        }
      }
    })
    .example('$0 build nu-mod -t mymod ', ' Builds "nu-mod" from "mymod"')
    // Output default based on another option, `name`
    // Uses the `handler` to set it at run time
    .default('output', undefined, './{name}')
  },
  
  handler: argv => {
    if ( !argv.o || !argv.output ) argv.o = argv.output = argv.name
    debug('build argv',argv)

    const properties = { name: argv.name }
    if (argv.file) {
      _.assign(properties, argv.file)
    }
    if (argv.json) {
      _.assign(properties, argv.json)
    }
    if (argv.set) {
      if (_.isArray(argv.set)){
        argv.set.forEach(set=>{
          debug('set props', set)
          let m = set.match(/(.+?)=(.+)/)
          debug
          if (!m) throw new Error(`Unkown property format "${set}" (prop=value)`)
          properties[m[1]] = m[2]
        })
      } else {
        debug('set prop', argv.set)
        let m = argv.set.match(/(.+?)=(.+)/)
        debug
        if (!m) throw new Error(`Unkown property format "${argv.set}" (prop=value)`)
        properties[m[1]] = m[2]
      }
    }

    const ts_opts = {
      output_path: argv.output,
      base_path: argv['template-path'],
      replace: argv.replace,
      properties: properties
    }

    const ts = new TemplateSet(argv.template, ts_opts)
    ts.go().then(()=> {
      console.log('Done creating "%s" in "%s"', argv.name, ts.output_path)
    })
    .catch(error => {
      console.error('Command failed: ', error.message)
      if (error.description) 
        console.error('',error.description)
      if (argv.debug) 
        console.error('',error.stack)
    })
  }
  
}
