#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var bootstrap = new (require('../index.js'))();
var module = bootstrap.module();
/* Set the module id ahead of time in order to set the relation to the module in
 * the other objects. The other objects will have their ids set by the platform
 */
module.id = uuid.v4();
var map = bootstrap.objects(module.id);
var objects = [ module ];
Object.keys(map).forEach(function(k) {
    objects.push(map[k]);
});
fs.writeFileSync(path.join('build', 'objects.json'), JSON.stringify(objects, null, 2));
