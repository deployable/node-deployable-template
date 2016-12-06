#!/usr/bin/env bash

set -uexo pipefail
which greadlink >/dev/null 2>/dev/null && readlink=greadlink || readlink=readlink
rundir=$($readlink -f "${0%/*}")
cd "$rundir"

NAME=dt
SCOPE=deployable

create_versions(){
  cp Dockerfile.base Dockerfile.4; perl -pi -e 's/alpine-node:.+/alpine-node:4/' Dockerfile.4
  cp Dockerfile.base Dockerfile.6; perl -pi -e 's/alpine-node:.+/alpine-node:6/' Dockerfile.4
  cp Dockerfile.base Dockerfile.7; perl -pi -e 's/alpine-node:.+/alpine-node:7/' Dockerfile.7
}

build() {
  local version=${1:-base}
  local tag=${1:-latest}
  docker build \
    --file $rundir/Dockerfile.$version \
    --tag $SCOPE/$NAME:${tag} \
    $rundir/..
}

rebuild() {
  create_versions
  build 
  build 6
  build 7
  build 4
}

clean(){
  docker rmi $SCOPE/$NAME
}

run() {
  docker run $SCOPE/$NAME
}

ARGS="${@:-build}"
$ARGS

