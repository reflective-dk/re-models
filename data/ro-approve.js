/* global $$ */
() => {
  return {
    render: function (view) {
      var API = function() {
          var self = this;
          this.data = {udstyr: {}};

          this.enable = () => {
            $$("godkend").enable();
          };
          this.disable = () => {
            $$("godkend").disable();
          };
          this.bindData = (snapshot) => {
console.log("DEBUG: bindData()");
            this.data = {};
            if (snapshot) {
              this.data = snapshot;
            }
            this.data.snapshots = [{"id":"8dd2bbb5-21fc-5e06-b2d7-3d03d0bbb47d","snapshot":[{"validity":[{"from":"2018-05-24T22:00:00.000Z","input":{"activeFrom":"2017-03-31T22:00:00.000Z","name":"Rektorat1","unitType":{"id":"e3a52ab7-77a2-54c6-a467-8259e4c81763"}}}]}]},{"id":"2a46f308-4227-52dd-b42c-f142e56f227c","registrations":[{"validity":[{"from":"2018-05-24T22:00:00.000Z","input":{"activeFrom":"2017-03-31T22:00:00.000Z","name":"Bestyrelse","unitType":{"id":"e3a52ab7-77a2-54c6-a467-8259e4c81763"},"parent":{"id":["56cc1fdc-9983-502a-b24f-6be3f7198913"]}}}]}]}];

            this.data.objects = [{"id":"8dd2bbb5-21fc-5e06-b2d7-3d03d0bbb47d","registrations":[{"validity":[{"from":"2018-05-24T22:00:00.000Z","input":{"activeFrom":"2017-03-31T22:00:00.000Z","name":"Rektorat1","unitType":{"id":"e3a52ab7-77a2-54c6-a467-8259e4c81763"}}}]}]},{"id":"2a46f308-4227-52dd-b42c-f142e56f227c","registrations":[{"validity":[{"from":"2018-05-24T22:00:00.000Z","input":{"activeFrom":"2017-03-31T22:00:00.000Z","name":"Bestyrelse","unitType":{"id":"e3a52ab7-77a2-54c6-a467-8259e4c81763"},"parent":{"id":["56cc1fdc-9983-502a-b24f-6be3f7198913"]}}}]}]}];

            // Build changes overview
            this.data.objects.forEach(function(obj) {
              $$("godkend_table").add({
                godkend_rt: "20-05-2018",
                godkend_status: 1,
                godkend_user: "some user",
                godkend_task: obj.registrations[0].validity[0].input,
              });
            });
          };
          this.syncData = () => {
            return null;
          };

          this.processes = [];
          this.suggestions = [];
      };
      var api = new API();
      view.addView({
 id: "godkend",
 type: "clean",
 rows: [{
  id: "godkend_table",
  view:"datatable",
    editable:false,
    spans:true,
    select: true,
    footer: true,
    columns:[
    { id: "godkend_rt", header:"Tidspunkt", type:"date",adjust:"data",footer: {text: "Ændringer med effekt fra og med: " + $$("vt").getValue() + " validerer og er klar til at blive godkendt",colspan: 4}},
    { id: "godkend_status", header: "Status",adjust:"header",
      template:function(obj) {
   		  return "<span class='webix_icon "+(obj.status === 1 ? "fa-thumbs-up" : "fa-hourglass-half")+"'></span>"
      }
    },
    { id: "godkend_user", header: "Bruger",adjust:"data"},
    { id: "godkend_task", header: "Ændring",adjust:"data",fillspace:true},
  ],
  }]
}
);
      return api;
    }
  };
};

