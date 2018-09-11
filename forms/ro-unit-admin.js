define([
  'webix', 'common/promise', 'models/situ', 'forms', 'forms/base', 'common/utils', 'views/ro/unit-admin'
], function(webix, promise, situ, forms, BaseForm, utils, unitAdminView) {

  function Form (args) {
    if (!args) {
      args = {};
    }

    args.name = 'ro-unit-admin';
    args.actionButtonLabel = 'Send';
    args.validOnUsed = true;

    BaseForm.call(this, args);

    this.data = {};
    this.changes = {};
  }

  Form.prototype = Object.create(BaseForm.prototype);
  Form.prototype.constructor = Form;

  Form.prototype.getStateAsObjects = function (validOn) {
    var self = this;
    var objects = [];
    // this.data contain modified snapshots, as key/value => id/snapshot
    Object.keys(this.data).forEach(function(id) {
      // Use time module for vt
      objects.push({id: id, registrations:[{validity:[{from: utils.toISOString(validOn), input:self.data[id]}]}]});
    });

     // Wrap data in object metadata, using vt as validity from
    return promise.resolve(objects);
  };

  Form.prototype.render = function (args) {
    var self = this;
    this.task = args.task;

    this.unitAdminView = unitAdminView({ form: this });
    return this.unitAdminView.add(args.view).then(function () {
      var promises = [];

      var createDataPromise = self.createOrganisationSelectData().then(self.unitAdminView.setHierachyData);
      var createUnitTypeDataPromise = self.createUnitTypeSelectData().then(self.unitAdminView.setUnitTypes);

      promises.push(createDataPromise);
      promises.push(createUnitTypeDataPromise);

      self.unitAdminView.setTreeDataFunction(function (hierarchyId) {
        return self.createTreeData(hierarchyId);
      });

      return promise.all(promises);
    });
  };

  Form.prototype.createOrganisationSelectData = function () {
    return this.facilitator.getOrganisations().then(function(hierarchies) {
      var items = [{ id: 0, value: "Vælg Organisation" }];
      hierarchies.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name
        });
      });
      return promise.resolve(items);
    });
  };

  Form.prototype.createUnitTypeSelectData = function () {
    return this.facilitator.getUnitTypes().then(function(types) {
      return promise.resolve(utils.asOptions(types));
    });
  };


  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  Form.prototype.createTreeData = function (hierarchyId) {
    var self = this;

    return this.facilitator.getSnapshots([hierarchyId]).then(function (hierarchyResult) {
      var hierarchy = hierarchyResult.objects[0];
      var parentPath = hierarchy.snapshot.pathElements[0].relation.split('.');
      var type = hierarchy.snapshot.pathElements[0].parentType;

      return self.facilitator.getUnits(hierarchy.id).then(function (data) {
        var possibleRoots = [];
        var allItems = {};

        // create all items and hashify
        data.objects.forEach(function(obj) {
          var item = {
            id: obj.id,
            value: obj.snapshot.name,
            snapshot: obj.snapshot,
            data:[]
          };
          allItems[obj.id] = item;
        });

        forms.populateFromDraft(self.task, allItems);
        // arrange items into tree data structure
        Object.keys(allItems).forEach(function(id) {
          var child = allItems[id];

          // Get parent object
          // XXX: what if more than one, pathelements ? Try then one at a time?
          var parent = child.snapshot;
          parentPath.forEach(function(pp) {
            if (parent) {
              parent = parent[pp];
            }
          });
          if (parent) {
            child.snapshot.parent = parent; // Used by form when navigatibg tree
            allItems[parent.id].data.push(child);
          } else {
            // Root
            possibleRoots.push(child);
          }
        });

        var root;
        possibleRoots.forEach(function (possibleRoot) {
          if (possibleRoot.data.length > 0) {
            root = possibleRoot;
            root.open = true;
          }
        });
        return promise.resolve({ data: [root], parentPath: parentPath, type});
      });
    });
  };

  return Form;
});
