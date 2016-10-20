//import * as mustache from 'mustache'

const debug     = require('debug')('dply::module-template')
const yargs  = require('yargs')
const TemplateSet = require('./template_set')

debug('dmod command running')

const argv = yargs
  .usage('Usage: $0 <command> [opts]')
  .env('DMOD_')

  // Build Command
  .command({
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
          describe: 'Replace existing files/directories',
          default: false,
          type: 'boolean'
        },
        set: {
          alias: 's',
          describe: 'Set a property for the templates',
        },
        file: {
          alias: 'f',
          describe: 'Read template properties from a file'
        }
      })
      .example('$0 build nu-mod -t mymod ', ' Builds "nu-mod" from "mymod"')
      // Output default based on another option, `name`
      .default('output', undefined, './{name}')
    },
    handler: argv => {
      if ( !argv.o || !argv.output ) argv.o = argv.output = argv.name
      const ts_opts = {
        output_path: argv.output,
        base_path: argv['template-path'],
        replace: argv.replace,
        vars: argv.set
      }

      const ts = new TemplateSet(argv.template, ts_opts)
      ts.go().then(()=> {
        console.log('Done creating "%s"', argv.name)
      })
    }
  })

  // Other Command
  .command({
    command: 'other',
    aliases: ['o'],
    desc: 'Other command',
    builder: yargs => {
      return argv = yargs
        .options({
          someopt: { demand: 'someopt'},
          twoopt: { description: 'two option'},
        })
        .example('$0 other -f foo.js', 'Other foo')
    },
    handler: argv => {
      debug('other argv',argv)
    }
  })

  .describe('debug', 'Debug output')
  .alias('debug', 'd')
  .global('debug')
  .group('debug', 'Global Options:')

  .describe('version', 'Show app version')
  .alias('version', 'v')
  .group('version', 'Global Options:')
  .version()
  
  .describe('help', 'Show help')
  .alias('help', 'h')
  .group('help', 'Global Options:')
  .help()

  .demand(1, 'Must provide a valid command')
  .epilog('Run `$0 <command> -h` for specific command help\nCopyright 2016')

  .argv


debug('argv',argv)


