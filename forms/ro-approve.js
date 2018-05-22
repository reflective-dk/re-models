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
      view.addView({ro-approve.webix});
      return api;
    }
  };
};

