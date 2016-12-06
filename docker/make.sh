#!/usr/bin/env bash

set -uexo pipefail
which greadlink >/dev/null 2>/dev/null && readlink=greadlink || readlink=readlink
rundir=$($readlink -f "${0%/*}")
cd "$rundir"

NAME=dt
SCOPE=deployable
FROM=mhart/alpine-node

create_versions(){
  cp Dockerfile.base Dockerfile.6; perl -pi -e 's/alpine-node:.+/alpine-node:6/' Dockerfile.6
  cp Dockerfile.base Dockerfile.4; perl -pi -e 's/alpine-node:.+/alpine-node:4/' Dockerfile.4
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

pull(){
  docker pull $FROM:6
}

pull_all(){
  pull
  docker pull $FROM:7
  docker pull $FROM:4
}

rebuild() {
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

ARGS="${@:-build}"
$ARGS

