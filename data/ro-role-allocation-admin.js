define([
  'webix', 'common/promise', 'models/situ', 'utils', 'views/ro/role-allocation-admin'
], function(webix, promise, situ, utils, roleAllocAdminView) {

  var form = {
    data: {},
    situ: situ,

    getStateAsObjects: function () {
      var objects = [];
      // this.data contain modified snapshots, as key/value => id/snapshot
      Object.keys(form.data).forEach(function(id) {
        // Use time module for vt
        objects.push({id: id, registrations:[{validity:[{input:form.data[id]}]}]});
      });

       // Wrap data in object metadata, using vt as validity from
      return promise.resolve(objects);
    },
    render: function (args) {
      this.roleAllocAdminView = roleAllocAdminView({ form: form });
      this.roleAllocAdminView.add(args.view).then(function () {
        createRoleOptions().then(form.roleAllocAdminView.setRoleOptions);
        createRoleAllocOptions().then(form.roleAllocAdminView.setRoleAllocOptions);
        createEmploymentOptions().then(form.roleAllocAdminView.setEmploymentOptions);
        createTreeData('0b5ef848-9242-4f0f-8f80-dc79f9d898fe').then(form.roleAllocAdminView.setTreeData);
      });

      return promise.resolve();
    } // render
  };

  return form;

  function createRoleOptions() {
    return form.situ.getRoles().then(function(roles) {
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
  }

  function createRoleAllocOptions() {
    return form.situ.getRoleAllocations().then(function(roles) {
      var items = []; //[{id:"0",value:"Vælg Allokeret Rolle"}];
      roles.objects.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name,
          snapshot: obj.snapshot
        });
      });
      return promise.resolve(items);
    });
  }

  function createEmploymentOptions() {
    return form.situ.getEmployments().then(function(employments) {
      var items = []; //[{id:"0",value:"Vælg Ansættelse"}];
      employments.objects.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name,
          snapshot: obj.snapshot
        });
      });
      return promise.resolve(items);
    });
  }

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createTreeData(hierarchyId) {
    return form.situ.getSnapshots([hierarchyId]).then(function (hierarchyResult) {
      var hierarchy = hierarchyResult.objects[0];
console.log("DEBUG: getSnapshots=",JSON.stringify(hierarchy));
      return form.situ.getUnits(hierarchy.id).then(function (data) {
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
  }
});
