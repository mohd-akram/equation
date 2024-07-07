// Generated by CoffeeScript 2.7.0
(function() {
  var allFeatures, disableFeature, enableFeature, getFeature, getFeatures, handleMessage, registerScripts, removePermissions, requestPermissions, saveFeature, unregisterScripts;

  allFeatures = {
    google: {
      scripts: [
        {
          id: 'google-forms-script',
          js: ['google-forms.js'],
          matches: ['https://docs.google.com/forms/*']
        },
        {
          id: 'google-picker-script',
          js: ['google-picker.js'],
          matches: ['https://docs.google.com/picker*'],
          allFrames: true
        }
      ],
      permissions: {
        origins: ['https://docs.google.com/forms/*', 'https://docs.google.com/picker*']
      }
    },
    webwork: {
      scripts: [
        {
          id: 'webwork-script',
          js: ['webwork.js'],
          matches: ['*://*/*']
        }
      ],
      permissions: {
        origins: ['*://*/*']
      }
    }
  };

  registerScripts = async function(name) {
    return (await chrome.scripting.registerContentScripts(allFeatures[name].scripts));
  };

  unregisterScripts = async function(name) {
    return (await chrome.scripting.unregisterContentScripts({
      ids: allFeatures[name].scripts.map(function(s) {
        return s.id;
      })
    }));
  };

  requestPermissions = async function(name) {
    return (await chrome.permissions.request(allFeatures[name].permissions));
  };

  removePermissions = async function(name) {
    return (await chrome.permissions.remove(allFeatures[name].permissions));
  };

  getFeatures = async function() {
    var ref;
    return (ref = ((await chrome.storage.sync.get('features'))).features) != null ? ref : {};
  };

  getFeature = async function(name) {
    var ref;
    return (ref = ((await getFeatures()))[name]) != null ? ref : {};
  };

  saveFeature = async function(name, feature) {
    var features;
    features = (await getFeatures());
    features[name] = feature;
    return (await chrome.storage.sync.set({features}));
  };

  enableFeature = async function(name) {
    var feature;
    feature = (await getFeature(name));
    if (feature.enabled) {
      return;
    }
    feature.enabled = true;
    await registerScripts(name);
    return (await saveFeature(name, feature));
  };

  disableFeature = async function(name) {
    var feature;
    feature = (await getFeature(name));
    if (!feature.enabled) {
      return;
    }
    feature.enabled = false;
    await unregisterScripts(name);
    return (await saveFeature(name, feature));
  };

  handleMessage = async function(request) {
    if (request.getFeature) {
      return (await getFeature(request.getFeature));
    } else if (request.enableFeature) {
      return (await enableFeature(request.enableFeature));
    } else if (request.disableFeature) {
      return (await disableFeature(request.disableFeature));
    } else if (request.requestPermissions) {
      return (await requestPermissions(request.requestPermissions));
    } else if (request.removePermissions) {
      return (await removePermissions(request.removePermissions));
    }
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    handleMessage(request).then(sendResponse);
    return true;
  });

  chrome.runtime.onInstalled.addListener(async function() {
    var name, results;
    results = [];
    for (name in allFeatures) {
      if (((await getFeature(name))).enabled) {
        results.push((await registerScripts(name)));
      } else {
        results.push(void 0);
      }
    }
    return results;
  });

}).call(this);

//# sourceMappingURL=service_worker.js.map
