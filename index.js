"use strict";

var fs = require('fs');
var path = require('path');
var requireyml = require('require-yml');
var loc = path.join(path.dirname(require.resolve('./index.js')), 'models');

module.exports = requireyml(loc);
