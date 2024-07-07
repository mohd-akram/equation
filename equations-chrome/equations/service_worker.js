// Generated by CoffeeScript 2.7.0
(function() {
  var getInputBoxes, isGoogleForms, isValidURL, loadEquations;

  isValidURL = function(url) {
    try {
      url = new URL(url);
    } catch (error) {
      return false;
    }
    return ['http:', 'https:'].includes(url.protocol) && !url.href.startsWith('https://chrome.google.com/webstore');
  };

  isGoogleForms = function(url) {
    if (!isValidURL(url)) {
      return;
    }
    url = new URL(url);
    return url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/');
  };

  getInputBoxes = function(selector) {
    window.inputBoxes = document.querySelectorAll(selector);
    return window.inputBoxes.length;
  };

  loadEquations = async function(tab) {
    var results, selector;
    if (!isValidURL(tab.url)) {
      return;
    }
    if (isGoogleForms(tab.url) && !chrome.webNavigation) {
      return;
    }
    selector = isGoogleForms(tab.url) ? '[data-response] input[data-initial-value], [data-response] textarea[data-initial-value], div:has(+[data-noresponses]) > div > div' : 'input[id*=AnSwEr]';
    try {
      try {
        results = (await chrome.scripting.executeScript({
          func: getInputBoxes,
          args: [selector],
          target: {
            tabId: tab.id
          }
        }));
      } catch (error) {
        return;
      }
      if (results[0].result > 0) {
        await chrome.scripting.insertCSS({
          files: ['vendor/jqmath-0.4.3.css'],
          target: {
            tabId: tab.id
          }
        });
        await chrome.scripting.insertCSS({
          css: 'fmath.ma-block { text-align: left }',
          target: {
            tabId: tab.id
          }
        });
        return (await chrome.scripting.executeScript({
          files: ['vendor/jquery-3.6.0.min.js', 'vendor/jqmath-etc-0.4.6.min.js', 'equation.js', isGoogleForms(tab.url) ? 'google-forms.js' : 'webwork.js'],
          target: {
            tabId: tab.id
          }
        }));
      }
    } catch (error) {}
  };

  chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    var permitted;
    if (!(changeInfo.status === 'complete' && isValidURL(tab.url))) {
      return;
    }
    permitted = (await chrome.permissions.contains({
      permissions: ['scripting', 'tabs'],
      origins: [tab.url]
    }));
    if (permitted) {
      return loadEquations(tab);
    }
  });

  if (chrome.webNavigation) {
    chrome.webNavigation.onCompleted.addListener(async function(e) {
      var url;
      if (!isValidURL(e.url)) {
        return;
      }
      url = new URL(e.url);
      if (url.hostname === 'docs.google.com' && url.pathname === '/picker') {
        return (await chrome.scripting.executeScript({
          files: ['google-forms.js'],
          target: {
            tabId: e.tabId,
            frameIds: [e.frameId]
          }
        }));
      }
    });
  }

}).call(this);

//# sourceMappingURL=service_worker.js.map
