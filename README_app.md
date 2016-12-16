# [Deployable Template](https://github.com/deployable/node-deployable-template)

Build files from a template set, merging properties in and running actions

## Install

    npm install deployable-template -g

## Run

    det build node-base \
      --output ./node-super-project \
      --set name="SuperProject" \
      --set description="Has more lasers than super man" \
      --set dev_name="Bob James" \
      --set dev_email="bob@james.com"


## Templates

Template files use handlebar templates to manage the property substitution.

    A {{ propname }} gets inserted.

All properties must exist when generating a template, otherwise an error will be thrown 
You can default a value in a template to:

    {{ default propname 'Some Other Value' }}

### Template Helpers

#### `json`
  
JSON Stringify a property. Useful in JSON files. 

    { "someprop": {{ json someprop }} }

#### `default`

Default a property to a value if it is undefined. 

    This is {{ default propname 'Some Value' }} here

## Examples

### with set

    det build node-es2015 \
      --name error-classes \
      --output ./node-error-classes \
      --set "description=New ES2015 Error Classes"

### with json

    det build node-es2015 \
      --output ./node-error-classes \
      --json '{ "name": "error-classes", "description": "New ES2015 Error Classes" }'

### with yaml file

```yaml
name: error-classes
description: New ES2015 Error Classes
```

    det build node-es2015 \
      --output ./node-error-classes \
      --file ./properties.yml \

### with json file

```json
{ 
 "name": "error-classes",
 "description": "New ES2015 Error Classes"
}
```

    det build node-es2015 \
      --output ./node-error-classes \
      --file ./properties.json \


## Help

```
$ det build --help
Usage: det build <template>

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
  bin/det build mytemplate   Builds "nu-mod" from "mymod"

```

