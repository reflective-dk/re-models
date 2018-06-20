define([
  'webix', 'common/promise', 'models/situ', 'utils', 'common/re-webix', 'views/ro/unit-admin'
], function(webix, promise, situ, utils, reWebix, unitAdminView) {

  var form = {
    data: {},
    situ: situ, //TODO other name? client?

    getInputs: function () {
      var inputs = [];
      // this.data contain modified snapshots, as key/value => id/snapshot
      Object.keys(form.data).forEach(function(id) {
        var input = form.data[id];
        input.id = id;
        inputs.push(input);
      });

       // Wrap data in object metadata, using vt as validity from
      return inputs;
    },
    render: function (args) {
      this.unitAdminView = unitAdminView({ form: form });
      this.unitAdminView.add(args.view).then(function () {
        createTreeData().then(form.unitAdminView.setTreeData);
        createSelectData().then(form.unitAdminView.setUnitTypes);
      });

      return promise.resolve();
    } // render
  };

  return form;

  function createSelectData(data) {
    return form.situ.getUnitTypes().then(function (data) {
      var items = [];
      data.objects.forEach(function(obj) {
        items.push({
          id: obj.id,
          value: obj.snapshot.name
        });
      });
      return promise.resolve(items);
    });
  }

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createTreeData() {
    return form.situ.getUnits().then(function (data) {
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
        if (item.id !== 'cb299631-509a-5cc2-97bc-a147184cde58') {
          if (item.snapshot.parents && item.snapshot.parents['tvaerfakultaert']) {
            item.snapshot.parent = item.snapshot.parents['tvaerfakultaert'];
          }
        }
        allItems[obj.id] = item;
      });

      // arrange items into tree data structure
      Object.keys(allItems).forEach(function(id) {
        var item = allItems[id];
        if (item.snapshot.parent) {
          // Add to parents data array
          allItems[item.snapshot.parent.id].data.push(item);
        } else {
          // Root
          possibleRoots.push(item);
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
  }
});
