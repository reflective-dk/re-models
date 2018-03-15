#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var confUtil = require('re-conf-util');

var conf = require('../index');

confUtil.buildObjects(conf).then(function(objects) {
    var output = JSON.stringify({ objects: objects }, null, 2);
    fs.writeFileSync(path.join('build', 'objects.json'), output);
});
