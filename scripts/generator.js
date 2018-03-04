var models = require(__dirname + '/../index');
const Promise = require('bluebird');

module.exports = function generator () {
  var objects = [];
  Object.keys(models).forEach(function(m) {
      var model = models[m];
      var classes = model.classes || {};
      var instances = model.instances || {};
      Object.keys(classes).forEach(function(c) {
          objects.push(classes[c]);
      });
      Object.keys(instances).forEach(function(c) {
          var collection = instances[c];
          Object.keys(collection).forEach(function(i) {
              objects.push(collection[i]);
          });
      });
  });
  return Promise.resolve(objects);
};