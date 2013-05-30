loadEquations = (tabId, tab) ->
  storeURL = 'https://chrome.google.com/webstore'
  getInputBoxes = "inputBoxes = document.querySelectorAll('input[id*=AnSwEr]')"

  if tab.url[...4] == 'http' and tab.url[...storeURL.length] != storeURL
    chrome.tabs.executeScript tabId,
      code: getInputBoxes, (result) ->
        if Object.keys(result[0]).length != 0
          chrome.tabs.insertCSS tabId,
            file: "mathscribe/jqmath-0.4.0.css"

          chrome.tabs.executeScript tabId,
            file: "mathscribe/jquery-2.0.1.min.js", ->
              chrome.tabs.executeScript tabId,
                file: "mathscribe/jqmath-etc-0.4.0.min.js", ->
                  chrome.tabs.executeScript tabId,
                    file: "equations.js", ->
                      chrome.tabs.executeScript tabId,
                        file: "webwork.js"

chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  if changeInfo.status == 'complete'
    chrome.permissions.contains
      permissions: ['tabs']
      origins: ["http://*/*", "https://*/*"],
      (permitted) ->
        if permitted
          loadEquations(tabId, tab)
