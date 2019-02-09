isValidURL = (url) ->
  try url = new URL url catch then return false
  ['http:', 'https:'].includes(url.protocol) and
  not url.href.startsWith 'https://chrome.google.com/webstore'

isGoogleForms = (url) ->
  return unless isValidURL url
  url = new URL url
  url.hostname is 'docs.google.com' and url.pathname.startsWith '/forms/'

loadEquations = (tab) ->
  return unless isValidURL tab.url
  return if isGoogleForms(tab.url) and not chrome.webNavigation

  selector =
    if isGoogleForms tab.url then 'input.quantumWizTextinputPaperinputInput'
    else 'input[id*=AnSwEr]'

  getInputBoxes =
    """
    inputBoxes = document.querySelectorAll('#{selector}');
    inputBoxes.length
    """

  chrome.tabs.executeScript tab.id,
    code: getInputBoxes, (result) ->
      return if chrome.runtime.lastError

      if result[0] > 0
        chrome.tabs.insertCSS tab.id,
          file: 'vendor/jqmath-0.4.3.css'

        chrome.tabs.executeScript tab.id,
          file: 'vendor/jquery-3.3.1.min.js', ->
            chrome.tabs.executeScript tab.id,
              file: 'vendor/jqmath-etc-0.4.6.min.js', ->
                chrome.tabs.executeScript tab.id,
                  file: 'equation.js', ->
                    chrome.tabs.executeScript tab.id,
                      file:
                        if isGoogleForms tab.url then 'google-forms.js'
                        else'webwork.js'

chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  return unless changeInfo.status is 'complete' and isValidURL tab.url
  chrome.permissions.contains
    permissions: ['tabs']
    origins: [tab.url],
    (permitted) -> loadEquations tab if permitted

if chrome.webNavigation
  chrome.webNavigation.onCompleted.addListener (e) ->
    return unless isValidURL e.url
    url = new URL e.url
    if url.hostname is 'docs.google.com' and url.pathname is '/picker'
      chrome.tabs.executeScript e.tabId,
        frameId: e.frameId, file: 'google-forms.js'
