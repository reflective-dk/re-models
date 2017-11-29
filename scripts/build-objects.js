#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var requireyml = require('require-yml');
var loc = path.join(path.dirname(require.resolve('../package.json')), 'models');

var models = requireyml(loc);
Object.keys(models).forEach(function(key) {
    var model = models[key];
    var output = JSON.stringify({ objects: model }, null, 2);
    fs.writeFileSync(path.join('build', key + '.json'), output);
});
