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
          this.bindData = (result) => {
            this.data = {snapshots:[],registrations:[]};

console.log("DEBUG: result=",result);
            if (result) {
              this.data.snapshots = result.extension.snapshots.objects;
              this.data.registrations = result.extension.registrations.objects;
            }

            // Build changes overview
            var treeData = [];
            this.data.snapshots.forEach(function(obj) {
              var newReg = self.data.registrations.filter(reg => reg.id === obj.id)[0].registrations[0];
              var rowData = {
                id: obj.id,
                godkend_user: "some user",
                godkend_class: obj.snapshot.class.name,
                data:[]
              };
              treeData.push(rowData);
              Object.keys(newReg.validity[0].input).forEach(function(prop) {
                var before = obj.snapshot[prop];
                var after = newReg.validity[0].input[prop];
                before = getPropertyValue(before);
                after = getPropertyValue(after);

                rowData.data.push({
                  godkend_rt: newReg.timestamp,
                  godkend_user: "some user",
                  godkend_class: obj.snapshot.class.name,
                  godkend_object: obj.snapshot.name,
                  godkend_property: prop,
                  godkend_before: before,
                  godkend_after: after,
                });
              });
            });
console.log("DEBUG: treeData=",treeData);
            // Add data to treetable
            $$("godkend_table").parse(treeData,'json');
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
  view:"treetable",
    editable:false,
    spans:true,
    select: true,
    footer: true,
    columns:[
    { id: "godkend_changes", header: "",adjust:"data",template:"{common.treetable()}"},
    { id: "godkend_rt", header:"Tidspunkt", minWidth: 200, adjust:"data",footer: {text: "Ændringer med effekt fra og med: " + $$("vt").getValue() + " validerer og er klar til at blive godkendt",colspan: 6}},
    { id: "godkend_user", header: "Ændret af",adjust:"data"},
    { id: "godkend_class", header: "Objekt Type",adjust:"data",fillspace:true},
    { id: "godkend_object", header: "Objekt",adjust:"data",fillspace:true},
    { id: "godkend_property", header: "Property",adjust:"data",fillspace:true},
    { id: "godkend_before", header: "Før",adjust:"data",fillspace:true},
    { id: "godkend_after", header: "Efter",adjust:"data",fillspace:true},
  ],
  }]
}
);
      return api;
    }
  };

  function getPropertyValue(prop) {
    if (typeof prop === 'object') {
      // relation?
      if (prop.id) {
        // XXX: get name
        return prop.id;
      }
    } else {
      return prop;
    }
  }
};

