"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

var modelUrn = 'model:metamodel';
var urns = [
    'class:core:object',
    'class:core:model',
    'class:core:class',
    'class:core:schema-validation'
];

module.exports = Bootstrap;

function Bootstrap() {
}

Bootstrap.prototype.model = function() {
    return loadDef(modelUrn);
};

Bootstrap.prototype.objects = function(modelId) {
    var map = {};
    urns.forEach(function(urn) { map[urn] = loadDef(urn, modelId); });
    return map;
};

function loadDef(urn, modelId) {
    var obj = requireyml(path.join(defloc, urn.replace(/:/g, '-')));
    if (modelId) {
        obj.registrations[0].validity[0].input.model = { id: modelId };
    }
    return obj;
}
