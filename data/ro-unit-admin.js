define([
  'webix', 'common/promise', 'forms', 'forms/base', 'common/utils', 'views/ro/unit-admin', 'lodash.get'
], function(webix, promise, forms, BaseForm, utils, unitAdminView, lodashGet) {

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
    this.validOnUsed = true;
  }

  Form.prototype = Object.create(BaseForm.prototype);
  Form.prototype.constructor = Form;

  Form.prototype.getStateAsObjects = function (validOn) {
    var self = this;
    var objects = [];
    // this.data contain modified snapshots, as key/value => id/snapshot
    Object.keys(this.data).forEach(function(id) {
      // Use time module for vt
      var validity = {input:self.data[id]};
      if (validOn) {
        validity.from = validOn;
      }
      objects.push({id: id, registrations:[{validity:[validity]}]});
    });

     // Wrap data in object metadata, using vt as validity from
    return promise.resolve(objects);
  };

  Form.prototype.render = function (args) {
    var self = this;
    this.task = args.task;

    this.unitAdminView = unitAdminView({ form: this, validOn: args.task.data.variables.validOn });
    return this.unitAdminView.add(args.view).then(function () {

      self.unitAdminView.setTreeDataFunction(function (hierarchyId) {
        return self.createTreeData(hierarchyId);
      });

      return promise.all([
        self.createOrganisationSelectData().then(self.unitAdminView.setHierachyData),
        self.createUnitTypeSelectData().then(self.unitAdminView.setUnitTypes),
        self.createLocationsSelectData().then(self.unitAdminView.setLocations),
      ]);
    });
  };

  Form.prototype.createOrganisationSelectData = function () {
    return this.facilitator.getOrganisations().then(function(hierarchies) {
      var items = utils.asOptions({objects: hierarchies});
      items.unshift({ id: 0, value: "Vælg Organisation" });
      return promise.resolve(items);
    });
  };

  Form.prototype.createUnitTypeSelectData = function () {
    return this.facilitator.getUnitTypes().then(function(types) {
      return promise.resolve(utils.asOptions(types));
    });
  };

  Form.prototype.createLocationsSelectData = function () {
    var self = this;
    return this.facilitator.getLocations().then(function(locations) {
      return self.facilitator.expandRelations(locations,'address').then(function(locations) {
        return promise.resolve(utils.asOptions(locations));
      });
    });
  };

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  Form.prototype.createTreeData = function (hierarchyId) {
    var self = this;
    return this.facilitator.cacheHierarchyTypes(hierarchyId)
      .then(function () {
        return self.facilitator.getSnapshots([{ id: hierarchyId }]);
      })
      .then(function (hierarchyResult) {
        var hierarchy = hierarchyResult.objects[0];
        var parentPath = hierarchy.snapshot.pathElements[0].relation.split('.');
        var type = hierarchy.snapshot.pathElements[0].parentType;
        return self.facilitator.getFullHierarchy(hierarchy.id)
        .then(function (full) {
          var all = [];
          utils.flattenTree(full, all);
          all = utils.asObject(all[0]);

          var draftIds = forms.populateFromDraft(self.task, all);
          return { data: full.map(utils.webixifyTree),
            parentPath: parentPath, type: type, draftIds: draftIds };
        });
      });
  };

  return Form;
});
