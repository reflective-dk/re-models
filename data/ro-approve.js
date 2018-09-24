define([
  'webix', 'common/promise', 'forms', 'forms/base', 'common/utils', 'views/ro/approve', 'lodash.get'
], function(webix, promise, forms, BaseForm, utils, approveView, lodashGet) {
  var self;
  function Form (args) {
    self = this;
    if (!args) {
      args = {};
    }

    args.name = 'ro-approve';
    args.actionButtonLabel = 'Godkend';
    args.validOnUsed = true;

    BaseForm.call(this, args);

    self = this;
    this.data = {};
    this.validOnUsed = true;
  }

  Form.prototype = Object.create(BaseForm.prototype);
  Form.prototype.constructor = Form;

  Form.prototype.render = function (args) {
    this.approveView = approveView({ form: this });
    return this.approveView.add(args.view).then(function () {
      return getChanges(args.task.data.extension)
      .then(function(changes) {
        // Build changes tables
        changes.forEach(function(change) {
          var table = $$(self.approveView.ids.godkend);
          change.properties.forEach(function(prop) {
            table.add({
              timestamp: change.timestamp,
              validFrom: change.from,
              author: change.author,
              class: change.class,
              object: change.name,
              propertyName: prop.name,
              propertyBeforeValue: prop.before,
              propertyAfterValue: prop.after,
            });
          });
          table.show();
          table.refresh();
        });

        return promise.resolve();
      });
    });
  };

  function getChanges(ext) {
    var changes = [];

    // Expand relations
    return self.facilitator.expandRelations(ext.snapshots,['parents','unitType','locations','responsibilities'])
    .then(function(snapshots) {
      return self.facilitator.expandRelations(ext.registrations,['parents','unitType','locations','responsibilities'])
      .then(function(registrations) {
        registrations.objects.forEach(function(rObj) {

          // Find same snapshot object with same id
          var snaps = snapshots.objects.filter(snap => snap.id === rObj.id);
          var before = getSnapshotsBefore(snaps, new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];
          var current = getSnapshots(snaps, new Date(rObj.registrations[0].validity[0].from), new Date(rObj.registrations[0].timestamp))[0];

          var properties = [];
          Object.keys(rObj.registrations[0].validity[0].input).forEach((key) => {
            // Prepare property
            var property = {
              key: key,
              before: before ? before.snapshot[key] : "",
              after: rObj.registrations[0].validity[0].input[key]
            };
            properties.push(property);
          });

          var change = {
            id: rObj.id,
            class: current.snapshot.class ? current.snapshot.class.name : 'no class',
            name: current.snapshot.name,
            from: webix.i18n.dateFormatStr(new Date(rObj.registrations[0].validity[0].from)),
            timestamp: webix.i18n.fullDateFormatStr(new Date(rObj.registrations[0].timestamp)),
<<<<<<< HEAD
            author: rObj.registrations[0].author.snapshot ? rObj.registrations[0].author.snapshot.name : rObj.registrations[0].author.id,
=======
            author: lodashGet(rObj, 'registrations[0].author.snapshot.name', rObj.registrations[0].author.id),
>>>>>>> fixed approve
            properties: getProperties(properties)
          };
          changes.push(change);
        });

        return promise.resolve(changes);
      });
    });
  }

  function getProperties(properties) {
    var result = [];
    properties.forEach(function(prop) {
      switch (prop.key) {
      case 'activeFrom':
        prop.before = utils.fromISOString(prop.before);
        prop.before = utils.toDateString(prop.before);
        prop.after = utils.fromISOString(prop.after);
        prop.after = utils.toDateString(prop.after);
        result.push({
          name: "Aktiv fra",
          before: prop.before,
          after: prop.after
        });
        break;
      case 'activeTo':
        prop.before = utils.fromISOString(prop.before);
        prop.before = utils.toDateString(prop.before);
        prop.after = utils.fromISOString(prop.after);
        prop.after = utils.toDateString(prop.after);
        result.push({
          name: "Aktiv til",
          before: prop.before,
          after: prop.after
        });
        break;
      case 'responsibilities':
        result.push({
          name: "Ansvar",
          after: utils.asList(prop.after),
          before: utils.asList(prop.before)
        });
        break;
      case 'name':
        result.push({
          name: "Navn",
          after: prop.after,
          before: prop.before
        });
        break;
      case 'shortName':
        result.push({
          name: "Kort navn",
          after: prop.after,
          before: prop.before
        });
        break;
      case 'seNr':
        result.push({
          name: "SE-nummer",
          after: prop.after,
          before: prop.before
        });
        break;
      case 'ean':
        result.push({
          name: "EAN-nummer",
          after: prop.after,
          before: prop.before
        });
        break;
      case 'costCenter':
        result.push({
          name: "Omkostningssted",
          after: prop.after,
          before: prop.before
        });
        break;
      case 'class':
        // Class is only added in first registration
        result.push({
          name: "Klasse",
          after: prop.after.name,
          before: prop.before ? prop.before.name : ""
        });
        break;
      case 'unitType':
        // Class is only added in first registration
        result.push({
          name: "Type",
          after: getRelationValue(prop.after),
          before: getRelationValue(prop.before)
        });
        break;
      case 'parents':
        if (prop.after) Object.keys(prop.after).forEach(function(key) {
          result.push({
            name: "Overenhed "+key,
            after: getRelationValue(prop.after[key]),
            before: getRelationValue(prop.before[key])
          });
        });
        break;
      case 'phoneNumbers':
        result.push({
          name: "Telefon numre",
          after: utils.asList(prop.after),
          before: utils.asList(prop.before)
        });
        break;
      case 'emailAddresses':
        result.push({
          name: "E-mail adresser",
          after: utils.asList(prop.after),
          before: utils.asList(prop.before)
        });
        break;
      case 'mailSuffixes':
        result.push({
          name: "Mail suffix",
          after: utils.asList(prop.after),
          before: utils.asList(prop.before)
        });
        break;
      case 'locations':
        result.push({
          name: "Lokationer",
          after: getRelationValue(prop.after),
          before: getRelationValue(prop.before)
        });
        break;
      case 'aliases':
        if (prop.after) Object.keys(prop.after).forEach(function(key) {
          switch (key) {
          case 'enName':
            result.push({
              name: "Navn [EN]",
              after: prop.after[key],
              before: prop.before ? prop.before[key] : ""
            });
            break;
          case 'enShortName':
            result.push({
              name: "Kort navn [EN]",
              after: prop.after[key],
              before: prop.before ? prop.before[key] : ""
            });
            break;
          case 'akronym':
            result.push({
              name: "Akronym",
              after: prop.after[key],
              before: prop.before ? prop.before[key] : ""
            });
            break;
          }
        });
        break;
      default:
console.log("DEBUG: unknown key=",prop.key);
console.log("DEBUG: before=",prop.before);
console.log("DEBUG: after=",prop.after);
        break;
      }
    });
    return result;
  }

  function getRelationValue(relation) {
    return relation ? relation.snapshot.name ? relation.snapshot.name : relation.id : "";
  }

  // Get snapshots filterd on vt and rt. Return sorted on knownOn, latest first
  function getSnapshots(snapshots,vt,rt) {
    var result = [];
    snapshots.forEach((snap) => {
      var from = new Date(snap.from);
      var to = new Date(snap.to);
      if (vt >= from && (snap.to === undefined || vt < to) && snap.context.knownOn > rt) {
        result.push(snap);
      }
    });
    return result.sort((a,b) => {a.to < b.to});
  }

  // Get snapshots that is before vt and rt. Return sorted on knownOn, latest first.
  function getSnapshotsBefore(snapshots,vt,rt) {
    var result = [];
    snapshots.forEach((snap) => {
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
  return Form;
});

