# Deployable Templates

Build file from a template set, merging properties in.

### Install

    npm install deployable-template -g

### Run

    dt build node-base \
      --output ./node-super-project \
      --set name="SuperProject" \
      --set description="Has more lasers than super man" \
      --set dev_name="Bob James" \
      --set dev_email="bob@james.com"

#### with yaml

    dt build node-es2015 \
      --output ./node-es2015-classes \
      --yaml 'name: es2015 classes\ndescription: New ES2015 Class helpers\n'

#### with json

    dt build node-es2015 \
      --output ./node-es2015-classes \
      --json '{ "name": "es2015 classes", "description": "New ES2015 Class helpers" }'

#### with file

    dt build node-express \
      --output . \
      --set name=new-web-app \
      --file ./properties.yml

### Help

```
$ dt build --help
Usage: dt build <template>

Global Options:
  --debug, -d    Debug output                                          [boolean]
  --version, -v  Show version number                                   [boolean]
  --help, -h     Show help                                             [boolean]

Options:
  --name, -n           Name for new templates
  --template-path, -p  Custom path to template sets
  --output, -o         Output Directory
  --replace, -r        Replace existing output        [boolean] [default: false]
  --set, -s            Set a template property
  --json, -j           JSON template properties
  --file, -f           Read template properties from a file (YAML or JSON)

Examples:
  bin/dt build mytemplate   Builds "nu-mod" from "mymod"

```

