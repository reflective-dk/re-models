define([
  'common/promise', 'models/situ', 'utils', 'common/re-webix', 'views/ro/approve'
], function(promise, situ, utils, reWebix, approveView) {
    var form = {
      data: {},
      situ: situ,

      render: function (args) {
        this.approveView = approveView({ form: form });
        return this.approveView.add(args.view).then(function () {
          return getChanges(args.task.data.extension)
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

            return promise.resolve();
          });
        });
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
      var before;
      if (snap.length !== 0) {
        before = getSnapshotsBefore(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];
      }
      var current = getSnapshots(snap[0], new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];

      // List before / after for each changed property, build array of promises
      var properties = [];
      Object.keys(rObj.registrations[0].validity[0].input).forEach((key) => {
        // Make promiese
        propertyNamePromises.push(before ? getProperty(before.snapshot[key]) : promise.resolve(""));
        propertyNamePromises.push(getProperty(rObj.registrations[0].validity[0].input[key]));

        // Prepare property
        var property = {
          key: key,
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

    if (propertyNamePromises.length === 0) {
     return promise.resolve([]);
    }

    // Promise all
    return promise.all(propertyNamePromises).then(function(result) {
      for (var i = 0; i < propertyDestination.length; i++) {
        var before = result[i*2];
        var after = result[i*2+1];
        switch (propertyDestination[i].key) {
          case 'activeFrom':
            propertyDestination[i].name = "Aktiv fra";
            before = utils.fromISOString(before);
            after = utils.fromISOString(after);
            break;
          case 'activeTo':
            propertyDestination[i].name = "Aktiv til";
            before = utils.fromISOString(before);
            after = utils.fromISOString(after);
            break;
          case 'responsibilities':
            propertyDestination[i].name = "Ansvar";
            after = utils.toCommanListString(before,after);
            before = utils.toCommanListString(before);
            break;
          case 'name':
            propertyDestination[i].name = "Navn";
            break;
          case 'class':
            // Class is only added in first registration
            propertyDestination[i].name = "Type";
            after = "Ny "+after.name;
            break;
          case 'phoneNumbers':
            propertyDestination[i].name = "Telefon numre";
            before = utils.asList(before);
            after = utils.asList(after);
            break;
          case 'emailAddresses':
            propertyDestination[i].name = "E-mail adresser";
            before = utils.asList(before);
            after = utils.asList(after);
            break;
          default:
console.log("DEBUG: unknown key=",propertyDestination[i].key);
console.log("DEBUG: before=",before);
console.log("DEBUG: after=",after);
            break;
        }
        propertyDestination[i].before = before;
        propertyDestination[i].after = after;
      }
      return changes;
    });
  }

  // Call snapshot, and return promise, for convert refs ids to snapshot name
  function getProperty(prop) {
    // Get name for ref. properties
//    if (prop !== undefined && prop.id !== undefined) {
//      return form.situ.getSnapshots([prop.id]).then(function(result) {
//        return result.objects[0].snapshot.name;
//      });
//    }
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
  return form;
});

