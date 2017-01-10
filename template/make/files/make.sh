#!/usr/bin/env bash

# Setup
set -uexo pipefail
which greadlink >/dev/null 2>/dev/null && readlink=greadlink || readlink=readlink
rundir=$($readlink -f "${0%/*}")
cd "$rundir"

# Vars
NAME={{ name }}
SCOPE=deployable
FROM=mhart/alpine-node
YARN_VERSION=0.18.0
ARGS="${@:-build}"

# Commands
create_versions(){
  cp docker/Dockerfile.base docker/Dockerfile.6
  perl -pi -e 's/alpine-node:.+/alpine-node:6/' docker/Dockerfile.6
  cp docker/Dockerfile.base docker/Dockerfile.4
  perl -pi -e 's/alpine-node:.+/alpine-node:4/' docker/Dockerfile.4
  cp docker/Dockerfile.base docker/Dockerfile.7
  perl -pi -e 's/alpine-node:.+/alpine-node:7/' docker/Dockerfile.7
}

# Download deps
download() {
  mkdir -p "$rundir"/pkg
  local file="yarn-v${YARN_VERSION}.tar.gz"
  local file_path="$rundir/pkg/${file}"
  wget -nc -c -O "${file_path}.tmp" \
    "https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/${file}"
  mv "${file_path}.tmp" "${file_path}"
}

# Create tar ball 
package(){
  mkdir -p pkg
  # don't use a name or timestamp in gzip so checksums stay the same
  tar -cvf pkg/deployable-template.tar --exclude .git/ --exclude pkg/ --exclude-from .npmignore . 
}

build() {
  package
  build_one
}

# Build the base image
build_one() {
  local version=${1:-base}
  local tag=${1:-latest}
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
  package
  create_versions
  build_one
  build_one 6
  build_one 4
  build_one 7
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
