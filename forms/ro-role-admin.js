define([
  'webix', 'common/promise', 'models/situ', 'common/utils', 'time', 'forms', 'forms/base', 'views/ro/role-admin'
], function(webix, promise, situ, utils, time, forms, BaseForm, roleAdminView) {

  function Form (args) {
    if (!args) {
      args = {};
    }

    args.name = 'ro-role-admin';
    args.actionButtonLabel = 'Send';

    BaseForm.call(this, args);

    this.ids = {
      approver: webix.uid().toString()
    };
    this.roleAdminView = new roleAdminView({ form: this });
    this.data = {};
  }

  Form.prototype = Object.create(BaseForm.prototype);
  Form.prototype.constructor = Form;

  Form.prototype.getStateAsObjects = function () {
    var objects = [], form = this;
    // form.data contain modified snapshots, as key/value => id/snapshot
    Object.keys(this.data).forEach(function(id) {
      objects.push({id: id, registrations:[{validity:[{input:form.data[id]}]}]});
    });

     // Wrap data in object metadata, using vt as validity from
    return promise.resolve(objects);
  };

  Form.prototype.render = function (args) {
    this.task = args.task;
    this.object = utils.getFormObjectFromTask({ formName: this.name, task: args.task, validTime: time.getValidTime() });

    this.roleAdminView.add(args.view, args.parameters);

    return this.createRoleResponsibiliesTree(args.task).then(this.roleAdminView.setTreeData).then(this.roleAdminView.populate);
  };

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  Form.prototype.createRoleResponsibiliesTree = function (task) {
    return promise.all([this.facilitator.getRoles(), this.facilitator.getResponsibilities()])
    .then(function (result) {
      var roles = result[0];
      var responsibilites = result[1];

      var allObjects = utils.asObject(roles.objects.concat(responsibilites.objects));

      forms.populateFromDraft(task, allObjects);

      var rolesRoot = {id: "roles", value: "Roller", open: true, data:[]};
      var responsibilitiesRoot = {id: "responsibilities", value: "Ansvar", open: true, data:[]};

      // Add roles
      roles.objects.forEach(function(role) {
        var item = allObjects[role.id];
        item.data = [];
        item.type = 'role';
        if (role.snapshot.responsibilities) {
          Object.keys(role.snapshot.responsibilities).forEach(function(key) {
            var ref = role.snapshot.responsibilities[key];
            var responsibilityRefItem = {refId: ref.id,index: key};  // cannot use id, since no double ids in tree
            item.data.push(responsibilityRefItem);
          });
        }
        item.data = item.data.sort(function(a,b) {return a.value > b.value ? 1 : -1});
        rolesRoot.data.push(item);
      });
      rolesRoot.data = rolesRoot.data.sort(function(a,b) {return a.value > b.value ? 1 : -1});

      responsibilites.objects.forEach(function(responsibility) {
        var item = allObjects[responsibility.id];
        item.type = 'responsibility';
        responsibilitiesRoot.data.push(item);
      });
      responsibilitiesRoot.data = responsibilitiesRoot.data.sort(function(a,b) {return a.value > b.value ? 1 : -1});

      return promise.resolve([rolesRoot, responsibilitiesRoot]);
    });
  };

  return Form;
});
