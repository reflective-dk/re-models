"use strict";

var path = require('path');
var requireyml = require('require-yml');
var defloc = path.join(path.dirname(require.resolve('./index')), 'definitions');

module.exports = Metamodel;

function Metamodel() {
    this.model = loadDef('model-re-metamodel');
    this.classes = {
        model: loadDef('class-re-model'),
        object: loadDef('class-re-object'),
        class: loadDef('class-re-class'),
        rule: loadDef('class-re-rule'),
        activation: loadDef('class-re-activation'),
        validationResult: loadDef('class-re-validation-result')
    };
    this.rules = {
        modelMustExist: loadDef('rule-model-must-exist')
    };
    this.activations = {
        modelMustExist: loadDef('activation-model-must-exist')
    };
}

function loadDef(name) {
    var obj = requireyml(path.join(defloc, name));
    return obj;
}
