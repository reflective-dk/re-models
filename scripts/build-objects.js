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
    var classes = model.classes || {};
    var instances = model.instances || {};
    Object.keys(classes).forEach(function(c) {
        objects.push(classes[c]);
    });
    Object.keys(instances).forEach(function(c) {
        var collection = instances[c];
        Object.keys(collection).forEach(function(i) {
            objects.push(collection[i]);
        });
    });
});
var output = JSON.stringify({ objects: objects }, null, 2);
fs.writeFileSync(path.join('build', 'objects.json'), output);
