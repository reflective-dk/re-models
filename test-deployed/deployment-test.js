"use strict";

var chai = require('chai');
chai.use(require('chai-uuid'));
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var rp = require('request-promise');
var path = require('path');
var deploymentResult = require('../deployment-result.json');

var bootstrap = new (require('../index.js'))();
var serviceUrl = 'http://35.187.86.158:8080'; // Type service on test.reflective.dk
var context = '{"domain": "base", "chain": "bootstrap", "extension": "bootstrap"}';
var headers = {
    'Content-type': 'application/json',
    context: context
};

describe('Deployed objects', () => {
    it('should validate successfully with the type service', function(done) {
        var objects = rp({
            uri: serviceUrl + '/validate',
            method: 'POST',
            headers: headers,
            body: deploymentResult,
            json: true
        }).then(function(data) {
            return data.objects.map(function(o) {
                var obj = {
                    id: o.id,
                    valid: o.snapshot.valid
                };
                if (o.snapshot.error) {
                    obj.error = o.snapshot.error;
                }
                console.log(obj);
                return obj;
            });
        });
        expect(Promise.all([
            expect(objects).to.eventually.all.have.property('valid', true),
            expect(objects).not.to.eventually.all.have.property('error')
        ])).notify(done);
    });
});
