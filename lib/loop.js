(function loop(value) {
  if (value != 100000) {
    return Promise.delay(10).then(function() {
      console.log('value:' + value);
      return value + 1;
    }).then(loop);
  }
  return Promise.resolve(value);
})(0);