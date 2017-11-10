"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

var moduleUrn = 'module:core';
var urns = [
    'class:core:object',
    'class:core:module',
    'class:core:class',
    'class:core:schema-validation'
];

module.exports = Bootstrap;

function Bootstrap() {
}

Bootstrap.prototype.module = function() {
    return loadDef(moduleUrn);
};

Bootstrap.prototype.objects = function(moduleId) {
    var map = {};
    urns.forEach(function(urn) { map[urn] = loadDef(urn, moduleId); });
    return map;
};

function loadDef(urn, moduleId) {
    var obj = requireyml(path.join(defloc, urn.replace(/:/g, '-')));
    if (moduleId) {
        obj.registrations[0].validity[0].input.module = { id: moduleId };
    }
    return obj;
}
