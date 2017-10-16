"use strict";

var requireyml = require('require-yml');

var urns = [ 'urn:core:object', 'urn:core:module', 'urn:core:class' ];

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
    var obj = requireyml('./definitions/' + urn.replace(/:/g, '-'));
    obj.registrations[0].validity[0].input.module = { id: moduleId };
    return obj;
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

