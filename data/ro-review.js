/* global webix $$ */
() => {
  return {
    render: function (view, task) {
      this.ids = {
        report: webix.uid().toString(),
        reportTable: webix.uid().toString()
      };
      var API = function() {
        this.enable = () => {
        };
        this.disable = () => {
        };
      };
      var reviewVariables = [];
      Object.keys(task.data.variables).forEach(function (variableKey) {
        var value = task.data.variables[variableKey];
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        reviewVariables.push({ name: variableKey, value: value});
      });

      var reportView = {
        id: this.ids.report,
        type: "clean",
        rows: [{
          id: this.ids.reportTable,
          view: "datatable",
          columns: [
            { id: "name", header: "Variable name", adjust: "data"},
            { id: "value", header: "value", adjust: "data"}
          ]
        }]
      };
      var api = new API();
      view.addView(reportView);
      $$(this.ids.reportTable).parse(reviewVariables);
      return api;
    }
  };
};

