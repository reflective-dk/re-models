#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');

var generator = require('./generator');
return generator().then((objects) => {
  var output = JSON.stringify({ objects: objects }, null, 2);
  fs.writeFileSync(path.join('build', 'objects.json'), output);
});
