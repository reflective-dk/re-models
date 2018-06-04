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

            // XXX: If class is blanket, then different

            var changes = getChanges(result.extension);
console.log("DEBUG: changes=",JSON.stringify(changes,null,2));
            // Build changes tables
            changes.forEach(function(change) {
              var table;
              if (change.class.id === 'blanket') {

                table = $$('godkend_blanket_table');
                table.add({
                  godkend_rt: change.timestamp,
                  godkend_user: "some user",
                  godkend_object: form.name,
                });
              } else {
                table = $$('godkend_object_table');
                change.properties.forEach(function(prop) {

                  table.add({
                    godkend_rt: change.timestamp,
                    godkend_user: change.user,
                    godkend_class: change.class,
                    godkend_object: change.name,
                    godkend_property: prop.name,
                    godkend_before: prop.before,
                    godkend_after: prop.after,
                  });
                });
              }
              table.show();
            });
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
    var changes = [];

    // Loop over registrations
    ext.registrations.objects.forEach((rObj) => {
      var properties = [];

      // Find same snapshot object with same id
      var snap = ext.snapshots.objects.filter(snap => snap.id === rObj.id);
      var before = {};
      if (snap.length !== 0) {
        before = getSnapshotsBefore(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];
      }
      current = getSnapshots(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];

      // List before / after for each changed property
      Object.keys(rObj.registrations[0].validity[0].input).forEach((key) => {
        properties.push({
          name: key,
          before: before ? before.snapshot[key] : "",
          after: rObj.registrations[0].validity[0].input[key]
        });
      });
console.log("DEBUG: rObj.registrations[0]=",rObj.registrations[0]);
      changes.push({
        id: rObj.id,
        class: current.snapshot.class.name,
        name: current.snapshot.name,
        timestamp: rObj.registrations[0].timestamp,
        user: "what?", //rObj.registrations[0].user,
        properties: properties
      });
    });

    return changes;
  }

  // Get snapshots filterd on vt and rt. Return sorted on knownOn, latest first
  function getSnapshots(obj,vt,rt) {
    var result = [];
    obj.snapshots.forEach((snap) => {
      var from = new Date(snap.from);
      var to = new Date(snap.to);
      if (vt >= from && (to === undefined || vt < to) && snap.context.knownOn > rt) {
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
        snap.to = new Date(snap.to);
        snap.context.knownOn = new Date(snap.context.knownOn);

        // Should be known at rt, and validTo should be before er at vt
        if (snap.to !== undefined && snap.to <= vt && snap.context.knownOn >= rt) {
          result.push(snap);
        }
      });

      // Sort by valid.to newest first
      return result.sort((a,b) => {a.to < b.to});
    }
    return [undefined];
  }
};

