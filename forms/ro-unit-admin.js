(args) => {


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
console.log("DEBUG: syncData() objects=",JSON.stringify(objects));
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
        properties.getItem('activeFrom').css = {"color": "#999999"};

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
          item = {id: args.uuid.v4(), value: prop.name};
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
    case 'unitType':
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
    date.setDate(date.getDate()+1);
    date.setUTCHours(0,0,0,0);
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
