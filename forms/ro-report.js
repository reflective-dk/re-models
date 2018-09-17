define([
  'webix', 'common/promise', 'common/utils', 'forms/base', 'views/ro/report'
], function(webix, promise, utils, BaseForm, reportView) {
  function Form (args) {
    if (!args) {
      args = {};
    }

    args.name = 'ro-report';
    args.actionButtonLabel = 'Send';

    BaseForm.call(this, args);

    this.ids = {
      approver: webix.uid().toString()
    };
    this.reportView = new reportView({ form: this });
    this.data = {};
    this.validOnUsed = true;
  }

  Form.prototype = Object.create(BaseForm.prototype);
  Form.prototype.constructor = Form;

  Form.prototype.render = function (args) {
    // Prepare parameters
    var fromDate = new Date();

    if (args.parameters === undefined) args.parameters = {};
    if (args.parameters.validFrom) {
      fromDate = new Date(args.parameters.validFrom);
    }
    var toDate = new Date(fromDate);
    toDate.setMonth(fromDate.getMonth()+3);
    args.parameters.validFrom = fromDate;
    args.parameters.validTo = toDate;

    return this.createRecipients({id: "72316a2c-85cb-4a5c-ac92-e7d4e7c88c57", name: "SmartOrg administrator"}, {id: "55b52821-017c-4c18-a023-14e2b544a857", name: "Rapport generering"})
    .then(this.reportView.setRecipients)
    .then(this.reportView.add(args.view, args.parameters));
  };

  Form.prototype.createReport = function(clazz, from, to) {
    var self = this;
    return this.facilitator.getObjects(clazz).then(function (data) {
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
      self.facilitator.basekit.client.setContext({domain: self.facilitator.basekit.client.getContext().domain});
      return self.facilitator.getTraces(allObjects).then(function(trace) {
        trace.objects.forEach(function(obj) {
          obj.registrations.forEach(function(reg) {
            reg.validity.forEach(function(val) {
              if (utils.toISOString(from) < val.from && val.from < utils.toISOString(to)) {
                // Iterate over properties
                var properties = self.getProperties(val.input);
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
                    snapshots.push(self.facilitator.getSnapshots([item.propertyValue],val.from));
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
                locations.push(self.getLocation(addressItem));
              } else {
                // just add the name
                item.propertyValue = snap.snapshot.name;
              }
            }
          });

          // Get all the locations
          return Promise.all(locations).then(function() {
            return promise.resolve(self.sortItems(allItems));
          });
        });
      });
    });
  };

  Form.prototype.getLocation = function (addressItem, validOn) {
    return this.facilitator.getSnapshots([{id: addressItem.propertyValue.id}], validOn).then(function(result) {
      var snapMap = utils.asObject(result.objects);
      var address = snapMap[addressItem.propertyValue.id];

      // The result is the address object
      addressItem.propertyValue = address.snapshot.streetAddress + ", " + address.snapshot.postalCode + " " +
                                  address.snapshot.city + ", " + address.snapshot.country;
    });
  };


  Form.prototype.sortItems = function (items) {
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
      if (a.objectName > b.objectName) return 1;
      if (a.objectName < b.objectName) return -1;
    });

    return items;
  };

  Form.prototype.getProperties = function (input) {
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
          break;
      }
      if (name && value) {
        properties.push({name: name, value: value !== null ? value : "-- SLETTET --"});
      }
    });

    return properties;
  };

  Form.prototype.createRecipients = function (role, responsibility) {
    var self = this;
    // Get role assignments that has the role and responsibilities
    var employments = [];
    var recipients = [];
    return this.facilitator.getRoleAllocations().then(function(ras) {
      // Filter on responsibilities, and create list of employments
      ras.objects.forEach(function(ra) {
        // The ra has to have the responsibility
        if (ra.snapshot.class.id === "025dfd36-f7a6-41e3-aa0c-64fe0376d3b7" && ra.snapshot.role && ra.snapshot.role.id === role.id && ra.snapshot.responsibilities) Object.keys(ra.snapshot.responsibilities).forEach(function(key) {
          var rsp = ra.snapshot.responsibilities[key];
          if (rsp.id === responsibility.id) {
            employments.push({id: ra.snapshot.employment.id});
          }
        });
      });

      // Get all employments
      var persons = [];
      return self.facilitator.getSnapshots(employments).then(function(result) {
        result.objects.forEach(function(employment) {
          if (employment.snapshot.class.id === "06c495eb-fcef-4c09-996f-63fd2dfea427") {
            if (employment.snapshot.person) persons.push(employment.snapshot.person);

            // Get first email
            var keys = Object.keys(employment.snapshot.emailAddresses);
            if (keys.length > 0) {
              recipients.push({email: employment.snapshot.emailAddresses[keys[0]], person: employment.snapshot.person});
            }
          }
        });

        return self.facilitator.getSnapshots(persons).then(function(result) {
          // Match up email and person name
          result.objects.forEach(function(person) {
            if (person.snapshot.class.id === "66d33a37-f73c-4723-8dca-5feb9cf420e4") {
              recipients.forEach(function(recipient) {
                if (recipient.person.id === person.id) {
                  Object.assign(recipient.person, person.snapshot);
                }
              });
            }
          });

          return promise.resolve({
            role: role,
            responsibility: responsibility,
            recipients: recipients
          });
        });
      });
    });
  };

  return Form;
});