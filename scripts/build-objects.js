#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var requireyml = require('require-yml');
var loc = path.join(path.dirname(require.resolve('../package.json')), 'models');

var models = requireyml(loc);
var objects = [];
Object.keys(models).forEach(function(m) {
    var model = models[m];
    Object.keys(model).forEach(function(k) {
        objects.push(model[k]);
    });
});
var output = JSON.stringify({ objects: objects }, null, 2);
fs.writeFileSync(path.join('build', 'objects.json'), output);
