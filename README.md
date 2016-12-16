# [Deployable Template](https://github.com/deployable/node-deployable-template)

Build files from a template set, merging properties in and running actions

For more detailed instructions see the [app readme](https://github.com/deployable/node-deployable-template/tree/master/app#readme))

## Install

    npm install deployable-template -g

or 

    yarn global add deployable-template

## Templates

Template files use handlebar templates to manage the property substitution.

    A >{{ varname }}< gets inserted.

All properties must exist when generating a template, otherwise an error will be thrown 
You can default a value in a template to:

    {{ default varname 'Some Other Value }}

## Containers

The app comes with a linux container `deployable/template`

### Build

    docker/make.sh

