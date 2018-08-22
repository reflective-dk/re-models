define([
  'common/promise', 'models/situ', 'common/utils', 'views/ro/report'
], function(promise, situ, utils, reportView) {
  var form = {
    data: {},
    situ: situ,

    render: function (args) {
      this.reportView = reportView({ form: form });
      this.reportView.setCreateReportFunction(createReport);

      // Prepare parameters
      var fromDate = new Date();

      if (args.parameters === undefined) args.parameters = {};
      if (args.parameters.validFrom) {
        fromDate = new Date(args.parameters.validFrom);
      }
      var toDate = new Date(fromDate);
      toDate.setMonth(fromDate.getMonth()+3);

      if (args.parameters.validTo) {
        toDate = new Date(args.parameters.validTo);
      }
      args.parameters.validFrom = fromDate;
      args.parameters.validTo = toDate;

      this.reportView.add(args.view, args.parameters).then(function () {
      });

      return promise.resolve();
    }
  };
  return form;

  function createReport(clazz, from, to) {
    return form.situ.getObjects(clazz).then(function (data) {
      var allSnapshots = {};
      var allObjects = [];
      var allItems = [];

      // create all items and hashify
      data.objects.forEach(function(obj) {
        // Build list of object ids
        allObjects.push({id: obj.id});
        allSnapshots[obj.id] = obj;
      });

      // Get all traces
      var snapshots = [];
      form.situ.client.setContext({domain: form.situ.client.getContext().domain});
      return form.situ.getTraces(allObjects).then(function(trace) {
        trace.objects.forEach(function(obj) {
          obj.registrations.forEach(function(reg) {
            reg.validity.forEach(function(val) {
              if (utils.toISOString(from) < val.from && val.from < utils.toISOString(to)) {
                // Iterate over properties
                var properties = getProperties(val.input);
                properties.forEach(function(property) {
                  var item = {
                    registration: utils.fromISOString(reg.timestamp),
                    validFrom: utils.fromISOString(val.from),
                    class: allSnapshots[obj.id].snapshot.class.name,
                    objectId: obj.id,
                    objectName: allSnapshots[obj.id].snapshot.name,
                    propertyName: property.name,
                    propertyValue: property.value,
                  };
                  allItems.push(item);

                  if (item.propertyValue.id) {
                    snapshots.push(form.situ.getSnapshots([item.propertyValue],val.from));
                  }
                });
              }
            });
          });
        });

        // Get snapshots of refs. at vt
        return Promise.all(snapshots).then(function(result) {
          // Build snapMap of all objects in results
          var snapMap = {};
          result.forEach(function(res) {
            snapMap = Object.assign(snapMap, utils.asObject(res.objects));
          });


          // Match up ids and replace value with name/pnr/adress
          var locations = [];
          allItems.forEach(function(item) {
            if (item.propertyValue.id) {
              var snap = snapMap[item.propertyValue.id];
              // Location?
              if (snap.snapshot.class.id === "cfd8d4db-96cd-45e2-8de7-0b257b63a4e7") {

                // Add location p number and address as properties
                item.propertyName = "Pnummer";
                item.propertyValue = snap.snapshot.pNr;
                // Prepare the address property
                var addressItem = Object.assign(item);
                addressItem.propertyName = "Adresse";
                addressItem.propertyValue = snap.snapshot.address;

                // Make a promise to get snapshot
                locations.push(getLocation(addressItem,));
              } else {
                // just add the name
                item.propertyValue = snap.snapshot.name;
              }
            }
          });

          // Get all the locations
          return Promise.all(locations).then(function() {
            return promise.resolve(sortItems(allItems));
          });
        });
      });
    });

    function getLocation(addressItem, validOn) {
      return form.situ.getSnapshots([addressItem.propertyValue.id], validOn).then(function(result) {
        var snapMap = utils.asObject(result.objects);
        var address = snapMap[addressItem.propertyValue.id];

        // The result is the address object
        addressItem.propertyValue = address.snapshot.streetAddress + ", " + address.snapshot.postalCode + " " +
                                    address.snapshot.city + ", " + address.snapshot.country;
      });
    }
  }

  function sortItems(items) {
    // Sort: object id -> property name -> validFrom
    items.sort(function(a,b) {
      if (a.objectId === b.objectId) {
        if (a.propertyName === b.propertyName) {
          if (a.validFrom === b.validFrom) return 0;
          if (a.validFrom > b.validFrom) return 1;
          if (a.validFrom < b.validFrom) return -1;
        }
        if (a.propertyName > b.propertyName) return 1;
        if (a.propertyName < b.propertyName) return -1;
      }
      if (a.objectId > b.objectId) return 1;
      if (a.objectId < b.objectId) return -1;
    });

    return items;
  }

  function getProperties(input) {
    var properties = [];

    // return array of property key/values, formatted for display
    Object.keys(input).forEach(function(key) {
      var name = undefined;
      var value = input[key];
      var values = input[key];
      switch (key) {

        case 'activeFrom':
          name = "Aktiv fra";
          value = utils.fromISOString(value);
          value = utils.toDateString(value);
          break;
        case 'activeTo':
          name = "Aktiv til";
          value = utils.fromISOString(value);
          value = utils.toDateString(value);
          break;
        case 'responsibilities':
          name = "Ansvar";
          value = utils.toCommanListString(value);
          break;
        case 'name':
          name = "Langt navn";
          break;
        case 'shortName':
          name = "Kort navn";
          break;
//        case 'class':
//          name = "Type";
//          value = value.name;
//          break;
        case 'phoneNumbers':
          name = "Telefon numre";
          value = utils.asList(value);
          break;
        case 'emailAddresses':
          name = "E-mail adresser";
          value = utils.asList(value);
          break;
        case 'mailSuffixes':
          name = "E-mail suffixes";
          value = utils.asList(value);
          break;
        case 'seNr':
          name = "SE nummer.";
          break;
        case 'ean':
          name = "EAN.";
          break;
        case 'unitType':
          name = "Enhedstype";
          break;
        case 'foreignIds':
          Object.keys(values).forEach(function(map) {
            switch (map) {
              case 'enhed':
                name = 'EnhedID';
                value = values[map];
                if (value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
                break;
              case 'VisningEnhed':
                name = 'Enhed';
                value = values[map];
                if (value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
                break;
            }
          });
          name = undefined;
          break;
        case 'aliases':
          Object.keys(values).forEach(function(map) {
            name = undefined;
            switch (map) {
              case 'acronym':
                name = 'Akronym';
                break;
              case 'enName':
                name = 'Langt engelsk navn';
                break;
              case 'enShortName':
                name = 'Kort engelsk navn';
                break;
            }
            if (name) {
              value = values[map];
              if (value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
            }
          });
          name = undefined;
          break;
        case 'parents':
          name = "Overenhed";
          Object.keys(values).forEach(function(map) {
            name += '.'+map;
            value = values[map];
            if (value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
          });
          name = undefined;
          break;
        case 'locations':
          name = "Lokation";
          Object.keys(values).forEach(function(map) {
            name += '.'+map;
            value = values[map];
            if (value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
          });
          name = undefined;
          break;
        default:
          name = undefined;
  console.log("DEBUG: unknown key=",key);
  console.log("DEBUG: unknown value=",value);
          break;
      }
      if (name && value) properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
    });

    return properties;
  }
});