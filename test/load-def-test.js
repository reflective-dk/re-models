"use strict";

var chai = require('chai');
chai.should();

var Metamodel = require.main.require('index.js');

describe('Test definition loading', function() {
    var metamodel = new Metamodel();
    it('should load model ReMetamodel', function() {
        metamodel.model().should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '54985140-62ec-49fd-b05a-661e090c405f',
            'registrations[0].validity[0].input.class.name': 'Model'
        });
    });
    it('should load class ReObject', function() {
        metamodel.objects()['class-re-object'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.name': 'Object'
        });
    });
    it('should load class ReModel', function() {
        metamodel.objects()['class-re-model'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Model'
        });
    });
    it('should load class ReClass', function() {
        metamodel.objects()['class-re-class'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Class'
        });
    });
    it('should load class ReRule', function() {
        metamodel.objects()['class-re-rule'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'Rule'
        });
    });
    it('should load class ReActivation', function() {
        metamodel.objects()['class-re-activation'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'RuleActivation'
        });
    });
    it('should load class ReValidationResult', function() {
        metamodel.objects()['class-re-validation-result'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'Class',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'Object',
            'registrations[0].validity[0].input.name': 'ValidationResult'
        });
    });
    it('should load rule ModelMustExist', function() {
        metamodel.objects()['rule-model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '69c26015-0e44-4315-a5d9-343a5308dfef',
            'registrations[0].validity[0].input.class.name': 'Rule',
            'registrations[0].validity[0].input.name': 'ModelMustExist'
        });
    });
    it('should load activation ModelMustExist', function() {
        metamodel.objects()['activation-model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': 'cb70fe97-13bd-4471-8f5f-a050c7f463bb',
            'registrations[0].validity[0].input.class.name': 'RuleActivation'
        });
    });
    it('should reload definitions on every instantiation', function() {
        metamodel.objects()['class-re-class'].extraneous = true;
        metamodel.objects()['class-re-class'].should.not.include({
            extraneous: true
        });
    });
});
