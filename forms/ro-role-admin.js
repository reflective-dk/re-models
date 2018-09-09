define([
  'common/promise', 'models/situ', 'common/utils', 'time', 'views/ro/role-admin'
], function(promise, situ, utils, time, roleAdminView) {

  var form = {
    data: {},
    situ: situ,

    getStateAsObjects: function () {
      var objects = [];
      // form.data contain modified snapshots, as key/value => id/snapshot
      Object.keys(form.data).forEach(function(id) {
        objects.push({id: id, registrations:[{validity:[{input:form.data[id]}]}]});
      });

       // Wrap data in object metadata, using vt as validity from
      return promise.resolve(objects);
    },
    render: function (args) {
      situ.cacher.clearCache();
      form.task = args.task;
      form.object = utils.getFormObjectFromTask({ formName: form.name, task: args.task, validTime: time.getValidTime() });

      form.roleAdminView = new roleAdminView({ form: form });
      form.roleAdminView.add(args.view, args.parameters);

      return createRoleResponsibiliesTree().then(form.roleAdminView.setTreeData).then(form.roleAdminView.populate);
    } // render
  };

  return form;

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createRoleResponsibiliesTree() {
    return promise.all([form.situ.getRoles(), form.situ.getResponsibilities()])
    .then(function (result) {
      var roles = result[0];
      var responsibilites = result[1];

      var allObjects = utils.asObject(roles.objects.concat(responsibilites.objects));

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
  }
});
