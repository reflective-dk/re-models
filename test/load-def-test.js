"use strict";

var chai = require('chai');
chai.should();

var Metamodel = require.main.require('index.js');

describe('Test definition loading', function() {
    var metamodel = new Metamodel();
    it('should load model ReMetamodel', function() {
        metamodel.model.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.model.id,
            'registrations[0].validity[0].input.class.name': 'ReModel'
        });
    });
    it('should load class ReObject', function() {
        metamodel.classes.object.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.name': 'ReObject'
        });
    });
    it('should load class ReModel', function() {
        metamodel.classes.model.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': metamodel.classes.object.id,
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReModel'
        });
    });
    it('should load class ReClass', function() {
        metamodel.classes.class.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': metamodel.classes.object.id,
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReClass'
        });
    });
    it('should load class ReRule', function() {
        metamodel.classes.rule.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': metamodel.classes.object.id,
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReRule'
        });
    });
    it('should load class ReActivation', function() {
        metamodel.classes.activation.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': metamodel.classes.object.id,
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReActivation'
        });
    });
    it('should load class ReValidationResult', function() {
        metamodel.classes.validationResult.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.class.id,
            'registrations[0].validity[0].input.class.name': 'ReClass',
            'registrations[0].validity[0].input.extends.id': metamodel.classes.object.id,
            'registrations[0].validity[0].input.extends.name': 'ReObject',
            'registrations[0].validity[0].input.name': 'ReValidationResult'
        });
    });
    it('should load rule ModelMustExist', function() {
        metamodel.rules.modelMustExist.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.rule.id,
            'registrations[0].validity[0].input.class.name': 'ReRule',
            'registrations[0].validity[0].input.name': 'ModelMustExist'
        });
    });
    it('should load activation of rule ModelMustExist', function() {
        metamodel.activations.modelMustExist.should.nested.deep.include({
            'registrations[0].validity[0].input.class.id': metamodel.classes.activation.id,
            'registrations[0].validity[0].input.class.name': 'ReActivation'
        });
    });
    it('should reload definitions on every instantiation', function() {
        new Metamodel().classes.class.extraneous = true;
        new Metamodel().classes.class.should.not.include({
            extraneous: true
        });
    });
});
