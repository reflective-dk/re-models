#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var metamodel = new (require('../index.js'))();
var model = metamodel.model;
var map = metamodel.objects;
var objects = [ model ];
Object.keys(map).forEach(function(k) {
    objects.push(map[k]);
});
var output = JSON.stringify({ objects: objects }, null, 2);
fs.writeFileSync(path.join('build', 'objects.json'), output);
