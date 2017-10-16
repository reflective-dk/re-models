"use strict";

var uuid = require('uuid');
var chai = require('chai');
chai.should();

var Bootstrap = require.main.require('index.js');

describe('Test definition loading', function() {
    var moduleId = uuid.v4();
    var bootstrap = new Bootstrap(moduleId);
    it('should load urn:core:object', function() {
        bootstrap.objects()['urn:core:object'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'urn:core:class',
            'registrations[0].validity[0].input.classId': 'urn:core:object'
        });
    });
    it('should load urn:core:module', function() {
        bootstrap.objects()['urn:core:module'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'urn:core:class',
            'registrations[0].validity[0].input.classId': 'urn:core:module',
            'registrations[0].validity[0].input.extends': 'urn:core:object'
        });
    });
    it('should load urn:core:class', function() {
        bootstrap.objects()['urn:core:class'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'urn:core:class',
            'registrations[0].validity[0].input.classId': 'urn:core:class',
            'registrations[0].validity[0].input.extends': 'urn:core:object'
        });
    });
    it('should reload definitions on every instantiation', function() {
        bootstrap.objects()['urn:core:class'].extraneous = true;
        bootstrap.objects()['urn:core:class'].should.not.include({
            extraneous: true
        });
    });
});
