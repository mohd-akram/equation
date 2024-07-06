isValidURL = (url) ->
  try url = new URL url catch then return false
  ['http:', 'https:'].includes(url.protocol) and
  not url.href.startsWith 'https://chrome.google.com/webstore'

isGoogleForms = (url) ->
  return unless isValidURL url
  url = new URL url
  url.hostname is 'docs.google.com' and url.pathname.startsWith '/forms/'

getInputBoxes = (selector) ->
  window.inputBoxes = document.querySelectorAll(selector);
  window.inputBoxes.length

loadEquations = (tab) ->
  return unless isValidURL tab.url
  return if isGoogleForms(tab.url) and not chrome.webNavigation

  selector =
    if isGoogleForms tab.url then '
      [data-response] input[data-initial-value],
      [data-response] textarea[data-initial-value],
      div:has(+[data-noresponses]) > div > div
    ' else 'input[id*=AnSwEr]'

  try
    try results = await chrome.scripting.executeScript
      func: getInputBoxes
      args: [selector]
      target:
        tabId: tab.id
    catch then return

    if results[0].result > 0
      await chrome.scripting.insertCSS
        files: ['vendor/jqmath-0.4.3.css']
        target:
          tabId: tab.id

      await chrome.scripting.insertCSS
        css: 'fmath.ma-block { text-align: left }'
        target:
          tabId: tab.id

      await chrome.scripting.executeScript
        files: [
          'vendor/jquery-3.6.0.min.js'
          'vendor/jqmath-etc-0.4.6.min.js'
          'equation.js'
          if isGoogleForms tab.url then 'google-forms.js' else 'webwork.js'
        ]
        target:
          tabId: tab.id

chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  return unless changeInfo.status is 'complete' and isValidURL tab.url
  permitted = await chrome.permissions.contains
    permissions: ['scripting', 'tabs']
    origins: [tab.url]
  loadEquations tab if permitted

if chrome.webNavigation
  chrome.webNavigation.onCompleted.addListener (e) ->
    return unless isValidURL e.url
    url = new URL e.url
    if url.hostname is 'docs.google.com' and url.pathname is '/picker'
      await chrome.scripting.executeScript
        files: ['google-forms.js']
        target:
          tabId: e.tabId
          frameIds: [e.frameId]
