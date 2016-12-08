//import * as mustache from 'mustache'

const debug     = require('debug')('dply::template::command_line_build')
const TemplateSet = require('./template_set')
const path = require('path')
const _ = require('lodash')
const Properties = require('./properties')
const Stack = require('./stack')


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
            let file_path = path.resolve(name)
            let data = Properties.fileToDataSync(file_path)
            return data
          } catch (err) {
            console.error(`Failed to load --file "${name}":`, err.message)
            throw err
          }
        }
      }
    })
    .example('$0 build mytemplate --name numod', ' Builds "numod" from "mytemplate"')

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
    return ts.go().then(res => {
        console.log('Done templating "%s" in "%s"', argv.template, ts.output_path)
        debug('res', res)
      })
      .catch(error => {
        if ( argv.debug || process.env.DEBUG ) console.error('DEBUG: %s', error.stack)
        console.error('Template command failed:\n\n %s (%s)', error.message, error.name )
        if ( error.description )
          console.error('\n %s', error.description)
        let app_root = path.resolve(__dirname, '..') + path.sep
        debug('app root to remove frmo stack', app_root, __dirname)
        console.error('\n %s', Stack.nice(error, app_root) )

        process.exit(1)

        // console.log( new Error('test\ntest').stack.replace(/^[\s\S]+?\n    at /g, '    at ') )
      })
  }
  
}
