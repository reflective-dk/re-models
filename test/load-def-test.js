"use strict";

var uuid = require('uuid');
var chai = require('chai');
chai.should();

var Bootstrap = require.main.require('index.js');

describe('Test definition loading', function() {
    var moduleId = uuid.v4();
    var bootstrap = new Bootstrap(moduleId);
    it('should load class:core:object', function() {
        bootstrap.objects()['class:core:object'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:object'
        });
    });
    it('should load class:core:module', function() {
        bootstrap.objects()['class:core:module'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:module',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should load class:core:class', function() {
        bootstrap.objects()['class:core:class'].should.nested.deep.include({
            'registrations[0].validity[0].input.module': { id: moduleId },
            'registrations[0].validity[0].input.class': 'class:core:class',
            'registrations[0].validity[0].input.classId': 'class:core:class',
            'registrations[0].validity[0].input.extends': 'class:core:object'
        });
    });
    it('should reload definitions on every instantiation', function() {
        bootstrap.objects()['class:core:class'].extraneous = true;
        bootstrap.objects()['class:core:class'].should.not.include({
            extraneous: true
        });
    });
});
