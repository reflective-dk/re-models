define([
  'webix', 'common/promise', 'forms', 'forms/base', 'common/utils', 'views/ro/role-allocation-admin'
], function(webix, promise, utils, roleAllocAdminView) {

  function Form (args) {
    if (!args) {
      args = {};
    }

    args.name = 'ro-role-allocation';
    args.actionButtonLabel = 'Send';

    BaseForm.call(this, args);

    this.ids = {
      approver: webix.uid().toString()
    };
    this.roleAdminView = new roleAdminView({ form: this });
    this.data = {};
    this.validOnUsed = true;
  }

  Form.prototype.getStateAsObjects = function () {
    var self = this;
    var objects = [];
    // this.data contain modified snapshots, as key/value => id/snapshot
    Object.keys(this.data).forEach(function(id) {
      // Use time module for vt
      objects.push({id: id, registrations:[{validity:[{input:self.data[id]}]}]});
    });

     // Wrap data in object metadata, using vt as validity from
    return promise.resolve(objects);
  };

  Form.prototype.render = function (args) {
    var self = this;

    this.roleAllocAdminView = roleAllocAdminView({ form: this });
    this.roleAllocAdminView.add(args.view).then(function () {
      self.createRoleOptions().then(self.roleAllocAdminView.setRoleOptions);
      self.createEmploymentOptions().then(self.roleAllocAdminView.setEmploymentOptions);
      self.createTreeData('0b5ef848-9242-4f0f-8f80-dc79f9d898fe').then(self.roleAllocAdminView.setTreeData)
      .then(function() {
        self.createRoleAllocData().then(self.roleAllocAdminView.setTableData);
      });
    });
    return promise.resolve();
  };

  Form.prototype.createRoleOptions = function () {
    return this.situ.getRoles().then(function(roles) {
      var items = []; //[{id:0,value:"Vælg Rolle"}];
      roles.objects.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name,
          snapshot: obj.snapshot
        });
      });
      return promise.resolve(items);
    });
  };

  // Create data for the datatable
  Form.prototype.createRoleAllocData = function () {
    return this.facilitator.getRoleAllocations().then(function(roleAllocations) {

      var data = [];
      roleAllocations.objects.forEach(function(ra) {
        ra.snapshot.id = ra.id;
        data.push({
          activeFrom: utils.fromISOString(ra.snapshot.activeFrom),
          activeTo: utils.fromISOString(ra.snapshot.activeTo),
          name: ra.snapshot.name,
          employment: ra.snapshot.employment ? ra.snapshot.employment.id : "",
          propagateFrom: ra.snapshot.propagateFrom ? ra.snapshot.propagateFrom.id : "",
          role: ra.snapshot.role ? ra.snapshot.role.id : "",
          responsibilities: ra.snapshot.responsibilities ? ra.snapshot.responsibilities : {},
          snapshot: ra.snapshot
        });
      });
      return promise.resolve(data);
    });
  };

  Form.prototype.createEmploymentOptions = function () {
    return this.facilitator.getEmployments().then(function(employments) {
      var items = [];
      employments.objects.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name,
          snapshot: obj.snapshot
        });
      });
      return promise.resolve(items);
    });
  };

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  Form.prototype.createTreeData = function (hierarchyId) {
    var self = this;

    return this.situ.getSnapshots([hierarchyId]).then(function (hierarchyResult) {
      var hierarchy = hierarchyResult.objects[0];
      return self.situ.getUnits(hierarchy.id).then(function (data) {
        var possibleRoots = [];
        var allItems = {};

        // create all items and hashify
        data.forEach(function(obj) {
          var item = {
            id: obj.id,
            value: obj.snapshot.name,
            snapshot: obj.snapshot,
            data:[]
          };
          allItems[obj.id] = item;
        });

        // arrange items into tree data structure
        Object.keys(allItems).forEach(function(id) {
          var child = allItems[id];

          // Get parent object
          // XXX: what if more than one, pathelements ? Try then one at a time?
          var parent = child.snapshot;
          var parentPath = hierarchy.snapshot.pathElements[0].relation.split('.');
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
        return promise.resolve([root]);
      });
    });
  };

  return Form;
});
