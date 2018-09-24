define([
  'webix', 'common/promise', 'forms', 'forms/base', 'common/utils', 'views/ro/role-allocation-admin'
], function(webix, promise, forms, BaseForm, utils, roleAllocAdminView) {

  function Form (args) {
    if (!args) {
      args = {};
    }

    args.name = 'ro-role-allocation';
    args.actionButtonLabel = 'Send';

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

    this.roleAllocAdminView = roleAllocAdminView({ form: this });
    this.roleAllocAdminView.add(args.view);

    return promise.all([self.createRoleOptions().then(self.roleAllocAdminView.setRoleOptions),
    self.createEmploymentOptions().then(self.roleAllocAdminView.setEmploymentOptions),
    self.createTreeData('0b5ef848-9242-4f0f-8f80-dc79f9d898fe').then(self.roleAllocAdminView.setTreeData)])
    .then(function() {
      self.createRoleAllocData(args.task).then(self.roleAllocAdminView.setTableData);
    });
  };

  Form.prototype.createRoleOptions = function () {
    return this.facilitator.getRoles().then(function(roles) {
      var items = [];
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
  Form.prototype.createRoleAllocData = function (task) {
    var self = this;
    return this.facilitator.getRoleAllocations().then(function(roleAllocations) {

      var data = [];
      var allObjects = {};
      roleAllocations.objects.forEach(function(ra) {
        ra.snapshot.id = ra.id;
        var item = Object.assign({}, ra.snapshot, {
          id: ra.id,
          activeFrom: utils.fromISOString(ra.snapshot.activeFrom),
          activeTo: utils.fromISOString(ra.snapshot.activeTo),
          snapshot: ra.snapshot
        });
        allObjects[ra.id] = item;
        data.push(item);
      });
      forms.populateFromDraft(task, allObjects);

      // In datatable there is no newInput or draftInput, since the table data is the new input
      data.forEach(function(item) {
        if (item.newInput) {
          // Set the new data on the item
          Object.assign(item, item.newInput);
          item.changed = true;
          self.changes[item.id] = item; // Keep a list over changes
        }
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

  Form.prototype.createTreeData = function (hierarchyId) {
    return this.facilitator.getFullHierarchy(hierarchyId).then(utils.webixifyTree);
  };

  return Form;
});
