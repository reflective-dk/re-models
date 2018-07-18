define([
  'webix', 'common/promise', 'models/situ', 'utils', 'views/ro/unit-admin'
], function(webix, promise, situ, utils, unitAdminView) {

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
      this.unitAdminView = unitAdminView({ form: form });
      this.unitAdminView.add(args.view).then(function () {
        createOrganisationSelectData().then(form.unitAdminView.setHierachyData);
        createUnitTypeSelectData().then(form.unitAdminView.setUnitTypes);

        form.unitAdminView.setTreeDataFunction(createTreeData)
      });

      return promise.resolve();
    } // render
  };

  return form;

  function createOrganisationSelectData() {
    return form.situ.getOrganisations().then(function(hierarchies) {
      var items = [{id:0,value:"Vælg Organisation"}];
      hierarchies.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name
        });
      });
      return promise.resolve(items);
    });
  }

  function createUnitTypeSelectData() {
    return form.situ.getUnitTypes().then(function(types) {
      return promise.resolve(utils.asOptions(types));
    });
  }


  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createTreeData(hierarchyId) {
    return form.situ.getAllUnitTypeIds(hierarchyId).then(function (allTypes) {

      return form.situ.getSnapshots([hierarchyId]).then(function (hierarchyResult) {
        var hierarchy = hierarchyResult.objects[0];
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
          root.allTypes = allTypes;
          return promise.resolve([root]);
        });
      });
    });
  }
});
