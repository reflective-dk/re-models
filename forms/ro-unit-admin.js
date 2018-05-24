(args) => {
  webixExtensions(); // not needed when reflective webix module

  return {
    render: function (view) {
      var API = function() {
        this.show = function(id) {
           // Show the changed unit
        }
        this.enable = function() {
  //         $$("unitadmin").enable();
        };
        this.disable = function() {
  //         $$("unitadmin").disable();
        };
        this.bindData = function(snapshots) {
console.log("DEBUG: bindData() snapshots=",snapshots);
  //         data = snapshot;
        };
        this.syncData = function() {
          var objects = [];

          // this.data contain modified snapshots
          var snapshots = this.data;

          Object.keys(snapshots).forEach(function(id) {
            var input = snapshots[id];
            delete input.id;

            var vtStr = $$("vt").getValue();
            var validFrom = toISOString(vtStr);

            objects.push({id:id, registrations:[{validity:[{from: validFrom, input: input}]}]});
          });
           // Wrap data in object metadata, using vt as validity from
          return {objects: objects};
        }
        this.suggestions = [

          createTreeData().then(function (data) {
            $$("unitadmin_tree").define("data", {data: data});
          }),
          createSelectData().then(function (options) {
            $$('unitadmin_properties').getItem('unitType').options = options;
          })
        ];
      };
      var api = new API();
      api.data = {};

      view.addView({ro-unit-admin.webix});

      // Bind events
      var filter = $$("unitadmin_filter");
      var tree = $$("unitadmin_tree");
      var properties = $$("unitadmin_properties");
      var updateButton = $$("unitadmin_update");
      var newButton = $$("unitadmin_new");

      // bind filter
      filter.attachEvent("onTimedKeyPress",function() {
        tree.filter("#value#",this.getValue());
      });

      // On tree item select
      tree.attachEvent("onBeforeSelect", function (id,e,n) {
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
        draftInput.unitType = draftInput.unitType.id;

        properties.getItem('parent').data = createTreeData();

        // Show dates as DD-MM-YYYY if not oo then use blank
        const format = webix.Date.dateToStr("%d-%m-%Y");
        var activeFromDate = new Date(draftInput.activeFrom);
        if (activeFromDate.getFullYear() < 1950) {
          draftInput.activeFrom = "";
        } else {
          if (typeof draftInput.activeFrom === 'string') {
            draftInput.activeFrom=format(activeFromDate);
          } else {
            draftInput.activeFrom=activeFromDate;
          }
        }
        var activeToDate = new Date(draftInput.activeTo);
        if (activeToDate.getFullYear() > 2500) {
          draftInput.activeTo = "";
        } else {
          draftInput.activeTo=activeToDate;
        }

        // Remove error markings
        Object.keys(properties.getValues()).forEach((key) => {
          properties.getItem(key).css='';
        });

        delete properties.getItem('activeFrom').required;
        delete properties.getItem('activeFrom').type;  // Cannot edit
        properties.setValues(draftInput);
        properties.enable();
        properties.refresh();
      });

      // Has properties changed? Errors?
      properties.attachEvent("onAfterEditStop", function(state, editor, ignoreUpdate) {
        var selectedId = tree.getSelectedId();
        var snap = {};
        if (selectedId != 0) {
          snap = tree.getItem(selectedId).snapshot;
        }
        if (!snap) snap = {};

        // Get values, do they validate and has they been changed?
        var errors = false;
        var changed = false;
        Object.keys(properties.getValues()).forEach((key) => {
          var prop = properties.getItem(key);
          prop.css='';

          // Only validate inline text fields with rule. Popups use rule for validation
          if (prop && prop.rule && prop.type === 'text' && prop.rule(prop.value) === false) {
            errors = true;
            prop.css="webix_confirm_error";
          }
          if (prop.required && prop.value == 0) {
            errors = true;
            prop.css="webix_confirm_error";
          }
          if (hasChanged(prop.value,snap[key],key)) {
            changed = true;
            prop.changed = true;
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

        saveProperties(properties, item, api.data);

        // Refresh tree, so new change is rendered
        properties.setValues({});
        properties.disable();
        tree.unselectAll();
        tree.refresh();
        this.disable();
      });

      // new button
      newButton.attachEvent("onItemClick", function() {
        // Add data
        properties.enable();
        properties.setValues({});
        properties.getItem('activeFrom').required = true;
        properties.getItem('activeFrom').type="date";

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
        properties.getItem('parent').data = createTreeData();
      });

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
          if (editor.config) delete editor.config.css;
        } else {
          editor.config.css = "webix_confirm_error";
        }
        properties.refresh();
      });

      // Show unit name based on ref id
      properties.on_render["hierarchy"] = function(id, config) {
        if (id.length != 0) {
          var treeItem = tree.getItem(id);
          var value = treeItem.value;
          if (treeItem.newInput) value = treeItem.newInput.name;
          return value;
        }
        return "";
      }
      properties.on_render["select"] = function(id, config) {
        if (id && id.length != 0) {
          var option = config.options.filter(option => option.id === id);
          return option.length === 1 ? option[0].value : "- Unknown type -";
        }
        return "";
      }

      return api;
    } // render
  };

  function createSelectData(data) {
    return args.getUnitTypes().then(function (data) {
      var items = [];
      data.objects.forEach(function(obj) {
      items.push({
          id: obj.id,
          value: obj.snapshot.name
        });
      });
      return promise.resolve(items);
    });
  }

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

function saveProperties(properties, item, data) {

   var tree = $$("unitadmin_tree");
   var prop = properties.getValues();

   // convert data to RO
   var parentId = prop.parent;
   var unitTypeId = prop.unitType;
   item.newInput = prop;
   item.newInput.parent = {id: parentId};
   item.newInput.unitType = {id: unitTypeId};

   // Convert dates back to ISO UTC
   if (prop.activeFrom == 0) {
     item.newInput.activeFrom = '1900-01-01T00:00:00.000Z';
   } else {
     item.newInput.activeFrom = toISOString(item.newInput.activeFrom);
   }
   if (prop.activeTo == 0) {
     item.newInput.activeTo = '9999-12-31T00:00:00.000Z';
     if (item.snapshot) item.newInput.activeTo = item.snapshot.activeTo;
   } else {
     item.newInput.activeTo = toISOString(item.newInput.activeTo);
   }

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

   if (item.snapshot === undefined) {
     item.newInput.class = {id: '5cad9972-6560-4136-a9d5-40c2d109be9b', name: 'Unit'};
   }

   // Prune newInput properties that has not been changed
   Object.keys(prop).forEach(function(key) {
     if (properties.getItem(key) && !properties.getItem(key).changed) delete item.newInput[key];
   });

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
    case 'activeFrom':
    case 'activeTo':
      if (v1 == 0) return false;

      // convert v1 to ISO ÚTC date
      v1 = toISOString(v1);
      break;
    case 'parent':
      return v1 !== v2.id;
    case 'phoneNumbers':
    case 'emailAddresses':
      var values = v1.split(',');
      if (v1.trim() == 0) {
        // if empty string, then values.length should be 0
        values = [];
      }
      var keys = Object.keys(v2);
      if (keys.length !== values.length) {
        return true;
      }
      for (var i = 0; i < keys.length; i++) {
        if (values[i].trim() !== v2[keys[i]]) {
          return true;
        }
      }
      return false;
  }
  return v1 !== v2;
}

function toISOString(v) {
  var date = v;
  if (typeof v === 'string') {
    var parse = webix.Date.strToDate("%d-%m-%Y");
    date = parse(v);
  }
  return date.toISOString();
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












function webixExtensions() {

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
      tree.unselectAll();
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

