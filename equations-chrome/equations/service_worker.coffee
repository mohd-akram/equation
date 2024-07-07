allFeatures =
  google:
    scripts: [
      id: 'google-forms-script'
      js: ['google-forms.js']
      matches: ['https://docs.google.com/forms/*']
    ,
      id: 'google-picker-script'
      js: ['google-picker.js']
      matches: ['https://docs.google.com/picker*']
      allFrames: true
    ]
    permissions:
      origins: ['https://docs.google.com/forms/*', 'https://docs.google.com/picker*']
  webwork:
    scripts: [
      id: 'webwork-script'
      js: ['webwork.js']
      matches: ['*://*/*']
    ]
    permissions:
      origins: ['*://*/*']

registerScripts = (name) ->
  await chrome.scripting.registerContentScripts allFeatures[name].scripts

unregisterScripts = (name) ->
  await chrome.scripting.unregisterContentScripts
    ids: allFeatures[name].scripts.map (s) -> s.id

requestPermissions = (name) ->
  await chrome.permissions.request allFeatures[name].permissions

removePermissions = (name) ->
  await chrome.permissions.remove allFeatures[name].permissions

getFeatures = ->
  (await chrome.storage.sync.get 'features').features ? {}

getFeature = (name) ->
  (await getFeatures())[name] ? {}

saveFeature = (name, feature) ->
  features = await getFeatures()
  features[name] = feature
  await chrome.storage.sync.set { features }

enableFeature = (name) ->
  feature = await getFeature name
  return if feature.enabled
  feature.enabled = true
  await registerScripts name
  await saveFeature name, feature

disableFeature = (name) ->
  feature = await getFeature name
  return unless feature.enabled
  feature.enabled = false
  await unregisterScripts name
  await saveFeature name, feature

handleMessage = (request) ->
  if request.getFeature
    await getFeature request.getFeature
  else if request.enableFeature
    await enableFeature request.enableFeature
  else if request.disableFeature
    await disableFeature request.disableFeature
  else if request.requestPermissions
    await requestPermissions request.requestPermissions
  else if request.removePermissions
    await removePermissions request.removePermissions

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
  handleMessage(request).then(sendResponse)
  return true

chrome.runtime.onInstalled.addListener ->
  for name of allFeatures
    if (await getFeature name).enabled
      await registerScripts name
