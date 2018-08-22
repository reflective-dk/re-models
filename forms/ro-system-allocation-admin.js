define([
  'common/promise', 'models/situ', 'common/utils', 'views/ro/system-allocation-admin'
], function(promise, situ, utils, systemAllocationAdminView) {

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
      this.systemAllocationAdminView = systemAllocationAdminView({ form: form });
      this.systemAllocationAdminView.add(args.view).then(function () {
//        createResponsibilitiesSelectData().then(form.roleAdminView.setTreeData);
//        createRoleResponsibiliesTree().then(form.roleAdminView.setUnitTypes);
      });

      return promise.resolve();
    } // render
  };

  return form;
});