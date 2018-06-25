define([
  'common/promise', 'models/situ', 'utils', 'views/ro/role-admin'
], function(promise, situ, utils, roleAdminView) {

  var form = {
    data: {},
    situ: situ,

    getStateAsObjects: function () {
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
      this.roleAdminView = roleAdminView({ form: form });
      this.roleAdminView.add(args.view).then(function () {
        createRoleResponsibiliesTree().then(form.roleAdminView.setTreeData);
      });

      return promise.resolve();
    } // render
  };

  return form;

  // Transform query response to webix tree data, where the snapshot is added/stored in the thee items
  function createRoleResponsibiliesTree() {

    return promise.all([form.situ.getRoles(),form.situ.getResponsibilities()])
    .then(function (result) {
      var roles = result[0];
      var responsibilites = result[1];

      var allObjects = utils.asObject(roles.objects.concat(responsibilites.objects));

      var rolesRoot = {id: "roles", value: "Roller", open:true, data:[]};
      var responsibilitiesRoot = {id: "responsibilities", value: "Ansvar", open:true, data:[]};

      // Add roles
      roles.objects.forEach(function(role) {
        var item = allObjects[role.id];
        item.type = 'role';
        if (role.snapshot.responsibilities) {
          Object.keys(role.snapshot.responsibilities).forEach(function(key) {
            var ref = role.snapshot.responsibilities[key];
            var responsibilityRefItem = {refId: ref.id};  // cannot use id, since no double ids in tree
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

      return promise.resolve([rolesRoot,responsibilitiesRoot]);
    });
  }
});


/*






// New controls ---

function setup() {
    // Define multitext popup type
    webix.editors.$popup.multiselect = {
      view:"popup",
      body:{
        rows:[
          { view:"text", hidden:true}, // InputNode
          { view:"form", borderless:true, elements: [
          ]}
        ]
      }
    };

    webix.editors.multiselect = webix.extend({
      popupType: "multiselect",
      focus:function(){},
      setValue:function(value) {
        var formView = this.getFormView();

        // Create values (id) of selected responsibilities
        var values = [];
        Object.keys(value).forEach(function(key) {
          var responsibility = value[key];
          values.push(responsibility.id);
        });

        this.config.css=''; // clear required marking

        // Remove existing views
        var ids = [];
        formView.getChildViews().forEach(function(view) {ids.push(view.config.id);});
        ids.forEach(function(id) {formView.removeView(id);});

        // setup multitext lines from property field value
        formView.addView(
          {cols:[ {view:"label",label:this.config.label,width: 90}, {name: 'select0', view:"select", width:230, options: [], value: '0' },
          {view:"button", type:"icon", icon: "plus-circle", width:28, on: {onItemClick:webix.editors.multiselect._addLine(this.config.Roptions)} }]},
        );
        for (var i = 0; i < values.length; i++) {
          this.getFormView().addView(
            {cols:[ {width: 90}, {name: 'select'+i, view:"select", disabled: true, options: this.config.Roptions, width:230, value: values[i].trim() },
            {view:"button", type:"icon", icon: "minus-circle", width:28, on: {onItemClick:webix.editors.multiselect._removeLine(this.config.Roptions)} }]}
          );
        }
        this._refresh(formView,this.config.Roptions);

        // bind change event on add select
        var editSelect = formView.getChildViews()[0].getChildViews()[1];
        var addButton = formView.getChildViews()[0].getChildViews()[2];
        editSelect.attachEvent("onChange", function(newv, oldv){
          if (newv !== 0) {
            addButton.enable();
          } else {
            addButton.disable();
          }
        });

        this._is_string = this.config.stringResult || (value && typeof value == "string");
        webix.editors.popup.setValue.call(this, value);
      },
      getValue:function(){
        var result = {};
        var options = this.config.Roptions;
        var formView = this.getFormView();
        var cnt = 0;
        formView.getChildViews().forEach(function(view) {
          var selectView = view.getChildViews()[1];
          var v = selectView.getValue();

          if (cnt > 0) {
            result[cnt] = {id:v,name:options.filter(o => o.id === v)[0].value};
          }
          cnt++;
        });
        return result;
      },
      popupInit:function(popup) {
      },
      getInputNode:function() {
        return this.getPopup().getBody().getChildViews()[0];
      },
      getFormView:function() {
        return this.getPopup().getBody().getChildViews()[1];
      },
      _removeLine:function(Roptions){
        var self = this;
        return function(id) {
          var lineId = webix.$$(id).getParentView().config.id;
          this.getFormView().removeView(lineId);
          self._refresh(this.getFormView(),Roptions);
        };
      },
      _addLine:function(Roptions){
        var self = this;
        return function(id) {
          var editSelect = this.getFormView().getChildViews()[0].getChildViews()[1];

          // Add the new line with the selected value from first line
          var view =
            {cols:[ {width: 90}, {name: id, view:"select", width:230, disabled: true, options: Roptions, value: editSelect.getValue() },
            {view:"button", type:"icon", icon: "minus-circle", width:28, on: {onItemClick:webix.editors.multiselect._removeLine} }]};
          this.getFormView().addView(view);
          self._refresh(this.getFormView(),Roptions);
        };
      },
      _refresh:function(formView,Roptions) {
        var editSelect = formView.getChildViews()[0].getChildViews()[1];
        var options = Object.assign(Roptions);

        // filter out options already in use and disable all selects except latest
        formView.getChildViews().forEach(function(view) {
          var selectView = view.getChildViews()[1];
          selectView.disable();
          var v = selectView.getValue();

          // remove values from options if exclusive
          options = options.filter(o => o.id !== v);
        });

        // Add the empty first line
        options.unshift({id:0,value:'Vælg ansvar og tilføj (+)'});

        // set new options on editSelect
        editSelect.define({'options':options,value:0});
        editSelect.enable();
        formView.getChildViews()[0].getChildViews()[2].disable();
        editSelect.refresh();
      }
    }, webix.editors.popup);


}
*/