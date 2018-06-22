define([
  'common/promise', 'models/situ', 'utils', 'views/ro/system-admin'
], function(promise, situ, utils, systemAdminView) {

  var form = {
    self: this,
    data: {},

    getStateAsObjects: function () {
      var object = {
        registrations: []
      };

      var input = {};
      if (form.object) {
        object.id = form.object.id;
      } else {
        input.class = { id: "4b72ebb8-8372-48e7-8b0c-42008ffd73a3", name: "form-data"};
        input.form = { id: form.task.formKey };
      }
      return;
    },
    render: function (args) {
      this.systemAdminView = systemAdminView({ form: form });
      this.systemAdminView.add(args.view).then(function () {

        // XXX: Get systems and systemaccess from RO

        promise.all([form.situ.getSystems(),form.situ.getSystemAccess(),form.situ.getVendors(),
//        form.situ.getAdministartorRoles(),form.situ.getSystemOwnerRoles()
        ])
        .then(function(result) {
console.log("DEBUG: result=",result);

          var data = [
            { vendor:"KMD", name:"OPUS Løn", owner:"Peter Andersen", department:"HR", administrator:"Rasmus Træls", systemroles:"" },
            { vendor:"Kombit", name:"SAPA", owner:"Peter Andersen", department:"HR", administrator:"Hans DuPont", systemroles:"" },
            { vendor:"Avaleo", name:"Avaleo Analytics", owner:"Kaj Nyborg", department:"Digitaliser", administrator:"Pia Jensen", systemroles:"admin,superbruger,læseadgang" },
            { vendor:"Rambøll Informatik", name:"Rambøll Care - Sundhed", owner:"Peter Andersen", department:"HR", administrator:"Orla Ibsen", systemroles:"admin,superbruger,læseadgang" },
            { vendor:"OS2", name:"KiTOS", owner:"Peter Andersen", department:"HR", administrator:"Tommy ", systemroles:"admin,superbruger,læseadgang" },
            { vendor:"EG Kommuneinformation A/S", name:"NetForvaltning Børn & Unge", owner:"Peter Andersen", department:"Børn & Unge", administrator:"Rasmus Træls", systemroles:"admin,superbruger,læseadgang" },
            { vendor:"Brugerklubben SBSYS", name:"SBSYS", owner:"Peter Andersen", department:"HR", administrator:"Rasmus Træls", systemroles:"admin,superbruger,læseadgang" },
          ];

          // XXX: Get persons behind the roles

          var vendors = utils.asObject(result[2].objects);

          // Populate datatable
          result[0].objects.forEach(function(system) {
            data.push({ vendor:"", name:system.snapshot.name, owner:"", department:"HR", administrator:"Rasmus Træls", systemroles:"" });
          });
          form.systemAdminView.setData(data);

        });

        // XXX: Add draft data from extension, to datatable

      });

      return promise.resolve();
    } // render
  };

  return form;
});