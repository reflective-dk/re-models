/* global $$ */
(args) => {
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

            return getChanges(result.extension)
            .then(function(changes) {
              // Build changes tables
              changes.forEach(function(change) {
                var table;
                if (change.class.id === 'blanket') {

                  table = $$('godkend_blanket_table');
                  table.add({
                    godkend_rt: change.timestamp,
                    godkend_author: change.author,
                    godkend_object: form.name,
                  });
                } else {
                  table = $$('godkend_object_table');
                  change.properties.forEach(function(prop) {

                    table.add({
                      godkend_rt: change.timestamp,
                      author: change.author,
                      godkend_class: change.class,
                      godkend_object: change.name,
                      godkend_property: prop.name,
                      godkend_before: prop.before,
                      godkend_after: prop.after,
                    });
                  });
                }
                table.show();
                table.refresh();
              });

            })
          };
          this.syncData = () => {
            return null;
          };

          this.processes = [];
          this.suggestions = [];
      };
      var api = new API();
      view.addView({ro-approve.webix});
      return api;
    }
  };

  function getChanges(ext) {
    var propertyNamePromises = [];
    var propertyDestination = [];
    var changes = [];

    // Loop over registrations
    ext.registrations.objects.forEach((rObj) => {

      // Find same snapshot object with same id
      var snap = ext.snapshots.objects.filter(snap => snap.id === rObj.id);
      var before = {};
      if (snap.length !== 0) {
        before = getSnapshotsBefore(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];
      }
      current = getSnapshots(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];

      // List before / after for each changed property, build array of promises
      var properties = [];
      Object.keys(rObj.registrations[0].validity[0].input).forEach((key) => {
        // Make promiese
        propertyNamePromises.push(before ? getProperty(before.snapshot[key]) : promise.resolve(""));
        propertyNamePromises.push(getProperty(rObj.registrations[0].validity[0].input[key]));

        // Prepare property
        var property = {
          name: key,
          before: "",
          after: ""
        };
        properties.push(property);
        propertyDestination.push(property);
      });

      changes.push({
        id: rObj.id,
        class: current.snapshot.class.name,
        name: current.snapshot.name,
        timestamp: webix.i18n.fullDateFormatStr(new Date(rObj.registrations[0].timestamp)),
        author: rObj.registrations[0].author,
        properties: properties
      });
    });

    // Promise all
    return promise.all(propertyNamePromises).then(function(result) {
      for (var i = 0; i < propertyDestination.length; i++) {
        propertyDestination[i].before = result[i*2];
        propertyDestination[i].after = result[i*2+1];
      }
      return changes;
    });
  }

  // Call snapshot, and return promise, for convert refs ids to snapshot name
  function getProperty(prop) {
    if (prop.id !== undefined) {
      return args.getSnapshots([prop.id]).then(function(result) {
        return result.objects[0].snapshot.name;
      });
    }
    return promise.resolve(prop);
  }

  // Get snapshots filterd on vt and rt. Return sorted on knownOn, latest first
  function getSnapshots(obj,vt,rt) {
    var result = [];
    obj.snapshots.forEach((snap) => {
      var from = new Date(snap.from);
      var to = new Date(snap.to);
      if (vt >= from && (snap.to === undefined || vt < to) && snap.context.knownOn > rt) {
        result.push(snap);
      }
    });
    return result.sort((a,b) => {a.to < b.to});
  }

  // Get snapshots that is before vt and rt. Return sorted on knownOn, latest first.
  function getSnapshotsBefore(obj,vt,rt) {
    var result = [];
    if (obj && obj.snapshots) {
      obj.snapshots.forEach((snap) => {
        snap.from = new Date(snap.from);
        var to = new Date(snap.to);
        snap.context.knownOn = new Date(snap.context.knownOn);

        // Should be known at rt, and validTo should be before er at vt
        if (snap.to !== undefined && to <= vt && snap.context.knownOn >= rt) {
          result.push(snap);
        }
      });

      // Sort by valid.to newest first
      return result.sort((a,b) => {a.to < b.to});
    }
    return [undefined];
  }
};

