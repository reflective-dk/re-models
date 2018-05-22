/* global webix,$$,situ, wrapObject, promise */
() => {
  return {
    render: function (view) {
      var API = function() {
        this.data = {person: {}, employment: {}};
        this.enable = () => {};
        this.disable = () => {};
        this.bindData = (snapshot) => {};
        this.syncData = () => {};
        this.processes = [];
        this.suggestions = [];
      };
      var api = new API();
      view.addView({
 type: "clean",
 rows: [
   {height:10},{
   view: "template",
   height: 30,
   template: "<center><b>Ændringer med effekt fra og med: #vt# validerer imod modellen og er klar til at blive godkendt.</b></center>",
   type: "clean",
   data: {vt: "01-03-2018"}
  },{

  view:"datatable",
    editable:false,
    spans:true,
    columns:[
    { id: "rt", header:"Tidspunkt", type:"date",adjust:"data"},
    { id: "user", header:"Bruger",adjust:"data"},
    { id: "unit", header: "Afdeling",adjust:"data"},
    { id: "role", header: "Rolle",adjust:"data"},
    { id: "old", header: "Før",adjust:"data"},
    { id: "new", header: "Efter",adjust:"data"},
    { id: "result", header: "Valid", template: "<span class='webix_icon fa-thumbs-up'></span>"},
  ],
  data: {
    data: [
      { id:1, rt:"01-03-2018", user:"Biger Blair", unit:"Institut for Planlægning", role:"Leder", old:"133514", new:"255548", result:1},
      { id:2, rt:"01-03-2018", user:"Biger Blair", unit:"Institut for Planlægning", role:"Leder", old:"S. Vindler", new:"Anton Hansen", result:1},
      { id:3, rt:"01-03-2018", user:"Biger Blair", unit:"Klinisk Institut", role:"Adgangsmanager", old:"", new:"200341", result:1},
      { id:4, rt:"01-03-2018", user:"Biger Blair", unit:"Klinisk Institut", role:"Adgangsmanager", old:"<i>ingen</i>", new:"Denis Dur", result:1},
    ],
    spans:[
      [1, "rt", 1, 2],
      [1, "user", 1, 2],
      [1, "unit", 1, 2],
      [1, "role", 1, 2],
      [1, "result", 1, 2],
      [3, "rt", 1, 2],
      [3, "user", 1, 2],
      [3, "unit", 1, 2],
      [3, "role", 1, 2],
      [3, "result", 1, 2],
    ]
  }
  }]
});
      return api;
    }
  };
};

