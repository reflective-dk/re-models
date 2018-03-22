#!/usr/bin/env node

"use strict";

var inspect = require('util').inspect;
var fs = require('fs');
var path = require('path');
var confUtil = require('re-conf-util');

var conf = require('../index');

confUtil.buildObjects(conf)
    .then(function(objects) {
        var output = JSON.stringify({ objects: objects }, null, 2);
        try { fs.mkdirSync('build'); } catch(e) {}
        fs.writeFileSync(path.join('build', 'objects.json'), output);
    })
    .catch(function(errors) {
        console.log('Operation failed:');
        console.log(inspect(errors, null, null));
    });
