#!/usr/bin/env node

"use strict";

var fs = require('fs');
var path = require('path');
var models = require('../index');

models.resolve().then(cnf => {
    var output = JSON.stringify({ objects: cnf.state['model'] }, null, 2);
    fs.writeFileSync(path.join('build', 'objects.json'), output);
});
