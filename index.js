"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

var modelUrn = 'model:metamodel';
var urns = [
    'class:core:object',
    'class:core:model',
    'class:core:class',
    'class:core:rule',
    'class:core:rule-application',
    'class:core:validation-result'
];

module.exports = Metamodel;

function Metamodel() {
}

Metamodel.prototype.model = function() {
    return loadDef(modelUrn);
};

Metamodel.prototype.objects = function() {
    var map = {};
    urns.forEach(function(urn) { map[urn] = loadDef(urn); });
    return map;
};

function loadDef(urn) {
    var obj = requireyml(path.join(defloc, urn.replace(/:/g, '-')));
    return obj;
}
