loadEquations = (tabId, tab) ->
  storeURL = 'https://chrome.google.com/webstore'
  getInputBoxes = "inputBoxes = document.querySelectorAll('input[id*=AnSwEr]');
                   inputBoxes.length"

  if tab.url[...4] is 'http' and tab.url[...storeURL.length] isnt storeURL
    chrome.tabs.executeScript tabId,
      code: getInputBoxes, (result) ->
        if result[0] > 0
          chrome.tabs.insertCSS tabId,
            file: "mathscribe/jqmath-0.4.0.css"

          chrome.tabs.executeScript tabId,
            file: "mathscribe/jquery-2.1.1.min.js", ->
              chrome.tabs.executeScript tabId,
                file: "mathscribe/jqmath-etc-0.4.0.min.js", ->
                  chrome.tabs.executeScript tabId,
                    file: "equation.js", ->
                      chrome.tabs.executeScript tabId,
                        file: "webwork.js"

chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  if changeInfo.status is 'complete'
    chrome.permissions.contains
      permissions: ['tabs']
      origins: ["http://*/*", "https://*/*"],
      (permitted) -> loadEquations(tabId, tab) if permitted
