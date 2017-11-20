"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

var modelName = 'model-re-metamodel';
var names = [
    'class-re-object',
    'class-re-model',
    'class-re-class',
    'class-re-rule',
    'class-re-activation',
    'class-re-validation-result',
    'rule-model-must-exist',
    'activation-model-must-exist'
];

module.exports = Metamodel;

function Metamodel() {
}

Metamodel.prototype.model = function() {
    return loadDef(modelName);
};

Metamodel.prototype.objects = function() {
    var map = {};
    names.forEach(function(name) { map[name] = loadDef(name); });
    return map;
};

function loadDef(name) {
    var obj = requireyml(path.join(defloc, name));
    return obj;
}
