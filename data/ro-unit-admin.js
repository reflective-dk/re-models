/* global $$, promise */
/**
 * expects argument with function getUnits
 **/
(args) => {
  return {
    render: function (view) {
     var API = function() {
       this.data = {};
       this.show = function(id) {
         // Show the changed unit
       }
       this.enable = function () {
//         $$("unitadmin").enable();
       };
       this.disable = function () {
//         $$("unitadmin").disable();
       };
       this.bindData = function (snapshot) {
         this.data = snapshot;
       };
       this.syncData = function () {
         // this.data contain modified objects
         return this.data;
       };
       this.suggestions = [

         promise.resolve()
         .then(() => {
           return createTreeData().then(function (data) {
             console.log(data);
             // get tree
             $$("unitadmin_tree").define("data", {data: data});
             // get unit types
             $$('unitadmin_properties').getItem('unitType').options = createSelectData();
           });
         })
       ];
     };

     setupEditors(); // not needed when reflective webix module
     view.addView({cols:[
  {rows:[
    {
      id: "unitadmin_filter",
    	view:"text",
    },
    {
      id: "unitadmin_tree",
      view:"tree",
      select:true,
      template:function(obj, common){
        var value = "<span>"+obj.value+"</span>";
        if (obj.newInput)
          value = '<span style="font-weight:bold">'+obj.newInput.name+"</span>";
        return common.icon(obj, common) + common.folder(obj, common) + value;
      }
    }
  ]},{
    view: "resizer"
  },{rows:[
    {cols:[
      {
        id: "unitadmin_new",
        view: "button",
        type: "form",
        label: "Opret",
        width: 60
      },
      {
        id: "unitadmin_end",
        view: "button",
        type: "danger",
        label: "Luk",
        disabled: true,
        width: 60
      },
      {},
      {
        id: "unitadmin_update",
        view: "button",
        label: "Opdatere",
        disabled: true,
        width: 80
      },

    ]},
    {view:"property", id:"unitadmin_properties", width:350, nameWidth: 120, autoheight: true, liveEdit: true,
      elements:[
        {id: "name", label: "Navn", type: "text", required: true},
        {id: "shortName", label: "Kort navn", type: "text"},
        {id: "unitType", label: "Type", type: "select", options:[]},
        {id: "phoneNumbers", label: "Telefon nr.", type: "multitext", rule: webix.rules.isPhoneNumber},
        {id: "emailAddresses", label: "E-mail", type: "multitext", rule: webix.rules.isEmail},
        {id: "seNr", label: "SE-nummer", type:"text", rule: webix.rules.isCvrSeNumber},
        {id: "ean", label: "EAN-nummer", type: "text", rule: webix.rules.isEanNumber},
        {id: "costCenter", label: "Omkostningssted", type: "text", rule: webix.rules.isCostCenter},
        {id: "parent", label: "Overordnet", type: "hierarchy", required: true},
        {id: "activeFrom", label: "Aktiv fra", type: "date"},
        {id: "activeTo", label: "Aktiv til", type: "date"},
      ],
    },
    {}
  ]}
]}
);

     // Bind events
     var filter = $$("unitadmin_filter");
     var tree = $$("unitadmin_tree");
     var properties = $$("unitadmin_properties");
     var updateButton = $$("unitadmin_update");
     var newButton = $$("unitadmin_new");
     var endButton = $$("unitadmin_end");

      // bind filter
      filter.attachEvent("onTimedKeyPress",function() {
			  tree.filter("#value#",this.getValue());
			});

     // On tree item select
     tree.attachEvent("onItemClick", function (id,e,n) {
       updateButton.disable();
       var item = tree.getItem(id);

       // create draft versions of data: dates, emails, phone numbers
       const def = {name:"",shortName:"",unitType:"",phoneNumbers:"",emailAddresses:"",seNr:"",ean:"",costCenter:"",activeFrom:"",activeTo:""};
       var draftInput = Object.assign(def,item.snapshot);
       if (item.newInput)
         draftInput = Object.assign(def,item.newInput);
       draftInput.phoneNumbers = asList(draftInput.phoneNumbers);
       draftInput.emailAddresses = asList(draftInput.emailAddresses);
       draftInput.parent = draftInput.parent.id;
       console.log('before');
       properties.getItem('parent').data = createTreeData();
       console.log('after');
       // Remove error markings
       Object.keys(properties.getValues()).forEach((key) => {
         properties.getItem(key).css='';
       });
       endButton.enable();
       properties.setValues(draftInput);
       properties.refresh();
     });

     // Has properties changed? Errors?
     properties.attachEvent("onAfterEditStop", function(state, editor, ignoreUpdate) {
       var selectedId = tree.getSelectedId();
       var snap = {};
       if (selectedId != 0) {
         snap = tree.getItem(selectedId).snapshot;
       }

       // Get values, do they validate and has they been changed?
       var errors = false;
       var changed = false;
       Object.keys(properties.getValues()).forEach((key) => {
         var item = properties.getItem(key);
         item.css='';

         // Only validate inline text fields with rule. Popups use rule for validation
         if (item && item.rule && item.type === 'text' && item.rule(item.value) === false) {
           errors = true;
           item.css="webix_confirm_error";
         }
         if (item.required && item.value == 0) {
           errors = true;
           item.css="webix_confirm_error";
         }

         if (hasChanged(item.value,snap[key],key)) {
           changed = true;
         }
       });
       if (changed && !errors) {
         updateButton.enable();
       } else {
         updateButton.disable();
       }
     });

     // Update button
     updateButton.attachEvent("onItemClick", function() {

       // Close open editor
       properties.editStop();
       var prop = properties.getValues();

       // Add new registration to changed object, ready for use with task complete
       var item = $$("unitadmin_tree").getSelectedItem();

       // New unit?
       if (item === undefined) {
         item = {id: uuid.v4(), value: prop.name};
         $$("unitadmin_tree").add(item, 0, prop.parent);
       }

       saveProperties(prop, item, this.data);

       // Refresh tree, so new change is rendered
       properties.setValues({});
       tree.unselectAll();
       tree.refresh();
       endButton.disable();
       this.disable();
     });

     // new button
     newButton.attachEvent("onItemClick", function() {

       // Add data
       properties.setValues({});

       // Remove error markings and mark required
       Object.keys(properties.getValues()).forEach((key) => {
         var item = properties.getItem(key);
         item.css='';

         if (item.required && item.value == 0) {
           item.css="webix_confirm_error";
         }
       });

       properties.refresh();
       tree.unselectAll();

       // init data for parent popup
       console.log('here');
       properties.getItem('parent').data = createTreeData();
     });

     // end button
     endButton.attachEvent("onItemClick", function() {
       // Modal dialog with end time
       webix.ui(
        {
          id:"unitadmin_endWindow",
          view:"window",
          modal:false,
          head: {
            view:"toolbar", margin:-4, cols:[
						{ view:"label", label: "Luk virkningsperioden" }
						]
					},
          position:"center",
          width: 300,
          height: 170,
          body:{
            rows:[
             {
              template: "<span style='font-size:14px;font-style:italic'>Nodens virkning sættes til at slutte midnat d. #vt#</span>",
              data: {vt: webix.Date.dateToStr("%d-%m-%Y")($$('vt').getValue())},
              height: 45,
             },
             {cols:[
              {},
              {
                view: "button",
                label: "Upfør",
                width: 80,
                on: {onItemClick: endUnit}
              },
              {
                view: "button",
                label: "Annuler",
                width: 80,
                click:"$$('unitadmin_endWindow').close();"
              },
              {}
            ]},
            ]
          }
        }
       ).show();
     });
    function endUnit() {
      var item = $$("unitadmin_tree").getSelectedItem();

      // Save properties
      properties.editStop();
      saveProperties($$("unitadmin_properties").getValues(), item, this.data);

      // Set end time
      var vt = new Date($$('vt').getValue());
      var activeTo = new Date(vt.getTime());
      activeTo.setUTCHours(0,0,0,0);
      item.newInput.activeTo = activeTo.toISOString();

      $$("unitadmin_endWindow").close();
      $$("unitadmin_end").disable();
      $$("unitadmin_properties").setValues({});
      $$("unitadmin_properties").refresh();
      $$("unitadmin_tree").unselectAll();
    }

     // Rule validation for inline property fields editors with rules
     properties.attachEvent("onTimedKeyPress", function(code,e) {
       var editor = properties.getEditor();
       var noErrors = true;
       if (editor && editor.config.rule && editor.config.type === 'text') {
         noErrors = editor.config.rule(editor.getValue());
       }
       if (editor && editor.config.required && editor.getValue() == 0) {
         noErrors = false;
       }

       if (noErrors) {
         delete editor.config.css;
       } else {
         editor.config.css = "webix_confirm_error";
       }
       properties.refresh();
     });

     // Show unit name based on ref id
     properties.on_render["hierarchy"] = function(id, config){
       if (id.length != 0) {
         var treeItem = tree.getItem(id);
         var value = treeItem.value;
         if (treeItem.newInput) value = treeItem.newInput.name;
         return value;
       }
       return "";
     }
     return new API();
    }
  };

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createTreeData() {
    return args.getUnits().then(function (data) {
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
};


function saveProperties(prop, item, data) {
   var tree = $$("unitadmin_tree");

   // convert data to RO
   var parentId = prop.parent;
   item.newInput = prop;
   item.newInput.parent = {id: parentId};

   // Create phone and emails RO structure
   item.newInput.phoneNumbers = item.newInput.phoneNumbers.split(',').reduce(function(map, obj) {
     map[Object.keys(map).length] = obj.trim();
     return map;
   }, {});
   item.newInput.emailAddresses = item.newInput.emailAddresses.split(',').reduce(function(map, obj) {
     map[Object.keys(map).length] = obj.trim();
     return map;
   }, {});

   // Move unit if parent has changed
   if (item.snapshot === undefined || item.newInput.parent.id !== item.snapshot.parent.id) {
     tree.move(item.id,0,tree,{parent: item.newInput.parent.id});
   }
   tree.open(item.newInput.parent.id, true);

   // Add reference in process control object
   data[item.id] = item.newInput;
}

// Compare control values agains RO
function hasChanged(v1,v2,id) {
  if (v1 === undefined || v1 === null) {
    v1 = '';
  }
  if (v2 === undefined || v2 === null) {
    v2 = '';
  }

  switch (id) {
    case 'phoneNumbers':
    case 'emailAddresses':
      var values = v1.split(',');
      var keys = Object.keys(v2);
      if (keys.length !== values.length) return false;
      for (var i = 0; i < keys.length; i++) {
        if (values[i].trim() !== v2[keys[i]]) return false;
      }
      return true;
  }
  return v1 !== v2;
}







function setupEditors() {
  // XXX: move to reflective webix module: rebix.rules

  // Reflective rules
  webix.rules.isPhoneNumber = function(value) {
    // [+##-]########, has to be a number
    // XXX: internal numbers
    return value.match("\^\(\\+45\-\)\?\\d\{8\}\$");
  }
  webix.rules.isCvrSeNumber = function(value) {
    return value.match("\^\\d\{8\}\$");
  }
  webix.rules.isEanNumber = function(value) {
    return value.match("\^\\d\{13\}\$");
  }
  webix.rules.isCostCenter = function(value) {
    return value.match("\^\\d\{10\}\$");
  }



  // Reflective editors


  // Define multitext popup type
  webix.editors.$popup.multitext = {
    view:"popup",
    body:{
      rows:[
        { view:"text", hidden:true}, // InputNode
        { view:"form", borderless:true, elements: [
        ]}
      ]
    }
  };

  webix.editors.multitext = webix.extend({
  	popupType: "multitext",
    focus:function(){},
    setValue:function(value) {
      var formView = this.getFormView();

      // use the property field rule for field validation if defined
      var validate = undefined;
      if (this.config.rule) {
        validate = this.config.rule;
      }
      this.config.css=''; // clear required marking

      // Remove existing views
      var ids = [];
      formView.getChildViews().forEach(function(view) {ids.push(view.config.id);});
      ids.forEach(function(id) {formView.removeView(id);});

      // setup multitext lines from property field value
      var values = value.split(',');
      formView.addView(
        {cols:[ {view:"label",label:this.config.label,width: 90}, {name: 'text0', view:"text", width:230, validate, validateEvent:"key", value: values.length ? values[0] : "" },
        {view:"button", type:"icon", icon: "plus-circle", width:28, on: {onItemClick:webix.editors.multitext._addLine(validate)} }]}
      );
      for (var i = 1; i < values.length; i++) {
        var v = values[i];
        this.getFormView().addView(
          {cols:[ {width: 90}, {name: 'text'+i, view:"text", width:230, validate, validateEvent:"key", value: v.trim() },
          {view:"button", type:"icon", icon: "minus-circle", width:28, on: {onItemClick:webix.editors.multitext._removeLine} }]}
        );
      }
  		this._is_string = this.config.stringResult || (value && typeof value == "string");
  		webix.editors.popup.setValue.call(this, value);
  	},
  	getValue:function(){
  	  var value = "";
      var formView = this.getFormView();

  	  // Build value from popup inputs
      formView.getChildViews().forEach(function(view) {
        var textView = view.getChildViews()[1];
        var v = textView.getValue();
        // Only add values that validate
        if (!textView.validate || textView.validate()) {

          // Only lines that is not empty
          if (v.trim().length) {
            if (value.length) value += ", ";
            value += v;
          }
        }
      });
      return value;
  	},
  	popupInit:function(popup) {
  	},
  	getInputNode:function() {
  		return this.getPopup().getBody().getChildViews()[0];
  	},
  	getFormView:function() {
  		return this.getPopup().getBody().getChildViews()[1];
  	},
  	_removeLine:function(id){
      var lineId = $$(id).getParentView().config.id;
  	  this.getFormView().removeView(lineId)
  	},
  	_addLine:function(validate){
  	  return function(id) {
        var view =
          {cols:[ {width: 90}, {name: id, view:"text", width:230, validate, validateEvent:"key", value: "" },
          {view:"button", type:"icon", icon: "minus-circle", width:28, on: {onItemClick:webix.editors.multitext._removeLine} }]};
        this.getFormView().addView(view);
  	  }
  	}
  }, webix.editors.popup);





  // Define unit picker popup type
  webix.editors.$popup.hierarchy = {
    view:"popup",
    body:{
      rows:[
        { view:"text", hidden:true}, // InputNode
        { view:"form", borderless:true, elements: [
						{
							view:"text",
              label:"Vælg ny overordnet enhed",
							labelPosition:"top"
						},
						{
							view:"tree",borderless:true,
							select:true,
						}
					]
				}
      ]
    }
  };

  webix.editors.hierarchy = webix.extend({
  	popupType: "hierarchy",
    focus:function() {
    },
  	popupInit:function(popup) {
      var inputNode = popup.getChildViews()[0].getChildViews()[0];
      var formView = popup.getChildViews()[0].getChildViews()[1];
      var filterInputView = formView.getChildViews()[0];
      var treeView = formView.getChildViews()[1];

      // bind tree select to popup closure that close the popup
      treeView.attachEvent("onSelectChange", function(ids) {
        inputNode.setValue(ids);
        webix.callEvent("onEditEnd",[ids]);
      });

      // bind filter
      filterInputView.attachEvent("onTimedKeyPress",function() {
				treeView.filter("#value#",this.getValue());
			});

  	},
    setValue:function(value) {
      var tree = this.getTreeView();
      // get from config - init from config
      tree.define("data", this.config.data);
      this.config.css=''; // clear required marking

  		this._is_string = this.config.stringResult || (value && typeof value == "string");
  		webix.editors.popup.setValue.call(this, value);
  	},
  	getValue:function() {
      return this.getInputNode().getValue();
  	},
  	getInputNode:function() {
  		return this.getPopup().getBody().getChildViews()[0];
  	},
  	getTreeView:function() {
  		return this.getPopup().getBody().getChildViews()[1].getChildViews()[1];
  	},
  }, webix.editors.popup);
}












function asList(obj) {
  var keys = Object.keys(obj);
  var result = "";
  keys.forEach(function(key) {
    if (result.length > 0) {
      result += ", ";
    }
    result += obj[key];
  });

  return result;
}

function createSelectData(data) {
var enhedstyper = [{"id":"Administrationsenhed","value":"Administrationsenhed"},{"id":"Forskningsenhed","value":"Forskningsenhed"},{"id":"Afdeling","value":"Afdeling"},{"id":"Institut","value":"Institut"},{"id":"Serviceenhed","value":"Serviceenhed"},{"id":"Fakultet","value":"Fakultet"},{"id":"Universitet","value":"Universitet"},{"id":"Center","value":"Center"},{"id":"Fællesadministration","value":"Fællesadministration"},{"id":"Skole","value":"Skole"},{"id":"Relationsskabende","value":"Relationsskabende"}];
  return enhedstyper;
}
