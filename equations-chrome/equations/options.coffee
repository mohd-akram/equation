checkboxes =
  google: '#enableGoogleForms'
  webwork: '#enableWebwork'

updatePermissions = ->
  for name, checkbox of checkboxes
    unless document.querySelector(checkbox).checked
      await chrome.runtime.sendMessage removePermissions: name

  # We need to do this because if a wildcard permission is removed, all
  # permissions are removed
  for name, checkbox of checkboxes
    if document.querySelector(checkbox).checked
      await chrome.runtime.sendMessage requestPermissions: name

handleCheckbox = (name) ->
  checkbox = document.querySelector checkboxes[name]

  feature = await chrome.runtime.sendMessage getFeature: name
  if feature.enabled
    checkbox.checked = true

  checkbox.onclick = ->
    if checkbox.checked
      granted = await chrome.runtime.sendMessage requestPermissions: name
      if granted
        await chrome.runtime.sendMessage enableFeature: name
      else
        checkbox.checked = false
    else
      await chrome.runtime.sendMessage disableFeature: name

    updatePermissions()

window.onload = ->
  for name of checkboxes
    handleCheckbox name
