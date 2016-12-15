#!/usr/bin/env bash

set -uexo pipefail
which greadlink >/dev/null 2>/dev/null && readlink=greadlink || readlink=readlink
rundir=$($readlink -f "${0%/*}")
cd "$rundir"

NAME=dt
SCOPE=deployable
FROM=mhart/alpine-node
YARN_VERSION=0.18.0
ARGS="${@:-build}"


create_versions(){
  cp Dockerfile.base Dockerfile.6; perl -pi -e 's/alpine-node:.+/alpine-node:6/' Dockerfile.6
  cp Dockerfile.base Dockerfile.4; perl -pi -e 's/alpine-node:.+/alpine-node:4/' Dockerfile.4
  cp Dockerfile.base Dockerfile.7; perl -pi -e 's/alpine-node:.+/alpine-node:7/' Dockerfile.7
}

download() {
  mkdir "$rundir"/../pkg
  wget -nc -c -O "$rundir/../pkg/yarn-v${YARN_VERSION}.tar.gz" https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz
}

pack(){
  mkdir -p ../pkg
  cd ../pkg
  pkg=$(npm pack ../app)
  cp $pkg deployable-template.tar.gz
  cd $rundir
}

build() {
  local version=${1:-base}
  local tag=${1:-latest}
  docker build \
    --build-arg YARN_VERSION=${YARN_VERSION} \
    --file $rundir/Dockerfile.$version \
    --tag $SCOPE/$NAME:${tag} \
    $rundir/..
}

pull(){
  docker pull $FROM:6
}

pull_all(){
  pull
  docker pull $FROM:7
  docker pull $FROM:4
}

rebuild() {
  pack
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

# runit
$ARGS
