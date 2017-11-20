"use strict";

var chai = require('chai');
chai.should();

var Metamodel = require.main.require('index.js');

describe('Test definition loading', function() {
    var metamodel = new Metamodel();
    it('should load model ReMetamodel', function() {
        metamodel.model().should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '54985140-62ec-49fd-b05a-661e090c405f',
            'registrations[0].validity[0].input.class.name': 'ReModel'
        });
    });
    it('should load class ReReObject', function() {
        metamodel.objects()['class-re-object'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.name': 'ReObject'
        });
    });
    it('should load class ReReModel', function() {
        metamodel.objects()['class-re-model'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReModel'
        });
    });
    it('should load class ReClass', function() {
        metamodel.objects()['class-re-class'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReClass'
        });
    });
    it('should load class ReReRule', function() {
        metamodel.objects()['class-re-rule'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReRule'
        });
    });
    it('should load class ReActivation', function() {
        metamodel.objects()['class-re-activation'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReActivation'
        });
    });
    it('should load class ReReValidationResult', function() {
        metamodel.objects()['class-re-validation-result'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '12b4049a-fb65-4429-a9d7-c91d88a58ac9',
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': 'c4315fa9-3765-40c0-ba45-ef821c416f83',
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReValidationResult'
        });
    });
    it('should load rule ModelMustExist', function() {
        metamodel.objects()['rule-model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': '69c26015-0e44-4315-a5d9-343a5308dfef',
            'registrations[0].validity[0].input.class.name': 'ReRule',
            'registrations[0].validity[0].input.name': 'ModelMustExist'
        });
    });
    it('should load activation of rule ModelMustExist', function() {
        metamodel.objects()['activation-model-must-exist'].should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': 'cb70fe97-13bd-4471-8f5f-a050c7f463bb',
            'registrations[0].validity[0].input.class.name': 'ReActivation'
        });
    });
    it('should reload definitions on every instantiation', function() {
        metamodel.objects()['class-re-class'].extraneous = true;
        metamodel.objects()['class-re-class'].should.not.include({
            extraneous: true
        });
    });
});
