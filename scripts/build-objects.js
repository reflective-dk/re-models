#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var bootstrap = new (require('../index.js'))();
var model = bootstrap.model();
/* Set the model id ahead of time in order to set the relation to the model in
 * the other objects. The other objects will have their ids set by the platform
 */
model.id = uuid.v4();
var map = bootstrap.objects(model.id);
var objects = [ model ];
Object.keys(map).forEach(function(k) {
    objects.push(map[k]);
});
// TODO: Remove requirement for object.type = 'application/json'
objects.forEach(function(o) { o.type = 'application/json'; });
var output = JSON.stringify({ objects: objects }, null, 2);
fs.writeFileSync(path.join('build', 'objects.json'), output);
