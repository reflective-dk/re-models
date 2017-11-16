"use strict";

var chai = require('chai');
chai.should();

var Metamodel = require.main.require('index.js');

describe('Test definition loading', function() {
    var metamodel = new Metamodel();
    it('should load model:metamodel', function() {
        metamodel.model().should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:model',
            'registrations[0].validity[0].input.modelId': 'model:metamodel'
        });
    });
    it('should load class:core:object', function() {
        metamodel.objects()['class:core:object'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:object'
        });
    });
    it('should load class:core:model', function() {
        metamodel.objects()['class:core:model'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:model',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should load class:core:class', function() {
        metamodel.objects()['class:core:class'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:class',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should load class:core:rule', function() {
        metamodel.objects()['class:core:rule'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:rule',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should load class:core:rule-application', function() {
        metamodel.objects()['class:core:rule-application'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:rule-application',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should load class:core:validation-result', function() {
        metamodel.objects()['class:core:validation-result'].should.nested.deep.include({
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:validation-result',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should reload definitions on every instantiation', function() {
        metamodel.objects()['class:core:class'].extraneous = true;
        metamodel.objects()['class:core:class'].should.not.include({
            extraneous: true
        });
    });
});
