"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

var urns = [
    'class:core:object',
    'class:core:module',
    'class:core:class',
    'class:core:schema-validation'
];

module.exports = Bootstrap;

function Bootstrap(moduleId) {
    this.moduleId = moduleId;
}

Bootstrap.prototype.objects = function() {
    var map = {};
    var moduleId = this.moduleId;
    urns.forEach(function(urn) { map[urn] = loadDef(urn, moduleId); });
    return map;
};

function loadDef(urn, moduleId) {
    var obj = requireyml(path.join(defloc, urn.replace(/:/g, '-')));
    obj.registrations[0].validity[0].input.module = { id: moduleId };
    return obj;
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
