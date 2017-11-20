"use strict";

var chai = require('chai');
chai.should();

var Metamodel = require.main.require('index.js');

describe('Test definition loading', function() {
    var metamodel = new Metamodel();
    it('should load model:metamodel', function() {
        metamodel.model().should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '54985140-62ec-49fd-b05a-661e090c405f',
            'registrations[0].validity[0].input.class.name': 'Model'
        });
    });
    it('should load class:core:object', function() {
        metamodel.objects()['class:core:object'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.name': 'Object'
        });
    });
    it('should load class:core:model', function() {
        metamodel.objects()['class:core:model'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Model'
        });
    });
    it('should load class:core:class', function() {
        metamodel.objects()['class:core:class'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Class'
        });
    });
    it('should load class:core:rule', function() {
        metamodel.objects()['class:core:rule'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Rule'
        });
    });
    it('should load class:core:rule-activation', function() {
        metamodel.objects()['class:core:rule-activation'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'RuleActivation'
        });
    });
    it('should load class:core:validation-result', function() {
        metamodel.objects()['class:core:validation-result'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'ValidationResult'
        });
    });
    it('should load rule:core:model-must-exist', function() {
        metamodel.objects()['rule:core:model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '69c26015-0e44-4315-a5d9-343a5308dfef',
            'registrations[0].validity[0].input.class.name': 'Rule',
            'registrations[0].validity[0].input.name': 'ModelMustExist'
        });
    });
    it('should load activation:core:model-must-exist', function() {
        metamodel.objects()['activation:core:model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': 'cb70fe97-13bd-4471-8f5f-a050c7f463bb',
            'registrations[0].validity[0].input.class.name': 'RuleActivation'
        });
    });
    it('should reload definitions on every instantiation', function() {
        metamodel.objects()['class:core:class'].extraneous = true;
        metamodel.objects()['class:core:class'].should.not.include({
            extraneous: true
        });
    });
});
