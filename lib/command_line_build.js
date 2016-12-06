//import * as mustache from 'mustache'

const debug     = require('debug')('dply::template::command_line_build')
const TemplateSet = require('./template_set')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const yaml = require('js-yaml')

module.exports = {

  command: 'build <template>',
  
  aliases: 'b',
  
  desc: 'Build a new project',
  
  builder: yargs => {
    return yargs
    .usage('Usage: $0 build <template>')
    .options({

      name: {
        alias: 'n',
        describe: 'Name for new templates'
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
            console.error(`Failed to parse --json argument:`, err.message)
            console.error('', data)
            throw err
          }
        }
      },

      // yaml: {
      //   alias: 'y',
      //   describe: 'YAML template properties',
      //   coerce: data => {
      //     debug('yaml data', data)
      //     try {
      //       return yaml.load(data)
      //     } catch (err){
      //       console.error(`Failed to parse --yaml argument:`, err.message)
      //       console.error('', data)
      //       throw err
      //     }
      //   }
      // },

      file: {
        alias: ['f'],
        describe: 'Read template properties from a file (YAML or JSON)',
        coerce: name => {
          try {
            debug('name', name)
            let require_path = path.resolve(name)
            debug('about to read file', require_path, typeof require_path)
            let file_data = fs.readFileSync(require_path, 'utf-8')
            let data = null
            // Attempt both JSON and YAML load
            try {
              data = JSON.parse(file_data)
            } catch (jerr) {
              debug('JSON parse failed with', jerr)
              try {
                data = yaml.load(file_data)
              } catch (yerr) {
                debug('yaml.load failed with', yerr)
                throw new Error(`Couldn't load file ${file_path} as JSON or YAML`)
              }
            }
            debug('got json', data)
            return data
          } catch (err) {
            console.error(`Failed to load --file "${name}":`, err.message)
            throw err
          }
        }
      }
    })
    .example('$0 build mytemplate', ' Builds "nu-mod" from "mymod"')

    // It seems to duplicate the command?
    .demand(3, 'Must provide a valid template to build - $0 build mytemplate')

    // Output default based on another option, `name`
    // Uses the `handler` to set it at run time
    //.default('output', undefined, './{name}')
  },
  
  
  // This is the main handler, should probably be held elsewhere, away
  // from yargs config. maybe in a list of commands

  handler: argv => {

    argv.template = argv._[2]

    if ( !argv.o || !argv.output ) {
      if ( !_.isNil(argv.name) ) {
        argv.o = argv.output = argv.name
      } else {
        argv.o = argv.output = `./${argv.template}-template-build`
      }
    }
    debug('build argv',argv, argv._)

    const properties = { name: argv.name }

    // We have a file of properties to read
    if (argv.file) {
      _.assign(properties, argv.file)
    }
    // We have a json blob of properties
    if (argv.json) {
      _.assign(properties, argv.json)
    }
    // We have specific properties set
    if (argv.set) {
      const setProp = set => {
        debug('set props', set)
        let m = set.match(/(.+?)=(.+)/)
        debug
        if (!m) throw new Error(`Unknown property format "${set}" (prop=value)`)
        properties[m[1]] = m[2]
      }
      if (_.isArray(argv.set)){
        argv.set.forEach(setProp)
      } else {
        setProp(argv.set)
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
      console.log('Done templating "%s" in "%s"', argv.template, ts.output_path)
    })
    .catch(error => {
      console.error('Deployable Template build failed:\n %s', error.message)
      if (error.description) 
        console.error(' %s', error.description)
      if (argv.debug || process.env.DEBUG ) 
        console.error(error.stack)
    })
  }
  
}
