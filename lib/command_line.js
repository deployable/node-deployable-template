//import * as mustache from 'mustache'

const debug     = require('debug')('dply::module_template')
const yargs  = require('yargs')
const TemplateSet = require('./template_set')

debug('command running')

const argv = yargs
  .usage('Usage: $0 -n [new-name] -t [template-name] -o [output-dir]')

  .env('DMOD_')

  .demand('name', 'A name for the new project is required')  
  .alias('name', 'n')
  .describe('name', 'Name of the new project')
  
  .alias('template', 't')
  .describe('template', 'Template set to build from')
  .default('template', 'base')

  .alias('template-path', 'p')
  .describe('template-path', 'Custom path to template sets')

  .alias('output', 'o')
  .describe('output', 'Output Directory')
  .default('output', undefined, './{name}')

  .alias('replace', 'r')
  .describe('replace', 'Replace existing files/directories')
  .default('replace', false)

  .alias('set','s')
  .describe('set', 'Set a property for the templates')

  .alias('file', 'f')
  .describe('file', 'Read template properties from a file')

  .alias('version', 'v')
  .describe('version', 'Show app version')
  .version()
  
  .alias('help', 'h')
  .help()

  .argv

if (!argv.o || !argv.output ) argv.o = argv.output = argv.name

debug('argv',argv)

const ts_opts = {
  output_path: argv.output,
  base_path: argv['template-path'],
  vars: argv.set
}

const ts = new TemplateSet(argv.template, ts_opts)
ts.go().then(()=> {
  console.log('Done creating "%s"', argv.name)
})
