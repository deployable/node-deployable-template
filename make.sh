#!/usr/bin/env bash

# Setup
set -uexo pipefail
which greadlink >/dev/null 2>/dev/null && readlink=greadlink || readlink=readlink
rundir=$($readlink -f "${0%/*}")
cd "$rundir"

# Vars
NAME=det
SCOPE=deployable
FROM=mhart/alpine-node
YARN_VERSION=0.18.0
ARGS="${@:-build}"

# Commands
create_versions(){
  cp docker/Dockerfile.base docker/Dockerfile.6; perl -pi -e 's/alpine-node:.+/alpine-node:6/' Dockerfile.6
  cp docker/Dockerfile.base docker/Dockerfile.4; perl -pi -e 's/alpine-node:.+/alpine-node:4/' Dockerfile.4
  cp docker/Dockerfile.base docker/Dockerfile.7; perl -pi -e 's/alpine-node:.+/alpine-node:7/' Dockerfile.7
}

# Download deps
download() {
  mkdir "$rundir"/pkg
  wget -nc -c -O "$rundir/pkg/yarn-v${YARN_VERSION}.tar.gz" https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz
}

# Pack the app for docker
pack(){
  mkdir -p pkg
  cd pkg
  pkg=$(npm pack ../app)
  cp $pkg deployable-template.tar.gz
  cd $rundir
}

package(){
  mkdir -p pkg
  # don't use a name or timestamp in gzip so checksums stay the same
  tar -cvf pkg/deployable-template.tar --exclude .git/ --exclude-from .npmignore . 
}

# Build the base image
build() {
  local version=${1:-base}
  local tag=${1:-latest}
  package
  docker build \
    --build-arg YARN_VERSION=${YARN_VERSION} \
    --file $rundir/docker/Dockerfile.$version \
    --tag $SCOPE/$NAME:${tag} \
    $rundir
}

# Pull base image
pull(){
  docker pull $FROM:6
}

# Pull all base images
pull_all(){
  pull
  docker pull $FROM:7
  docker pull $FROM:4
}

# Build everything
build_all() {
  #pack
  create_versions
  build 
  build 6
  build 4
  build 7
}

clean(){
  docker rmi $SCOPE/$NAME
}

run() {
  docker run $SCOPE/$NAME
}
 
publish_docker(){
  docker push $SCOPE/$NAME
}

publish_npm(){
  cd app
  npm test
  npm version patch -m "Update to %s"
  git push
  npm publish
  git push --tags
  cd "$rundir"
}

help() {
  set +x
  echo "Commands available in $0:"
  declare -F | sed 's/declare -f//g'
}

# runit
$ARGS
