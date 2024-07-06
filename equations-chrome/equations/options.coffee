handlePermissions = (checkbox, permissions) ->
  result = await chrome.permissions.contains permissions
  if result
    checkbox.checked = true

  checkbox.onclick = ->
    if checkbox.checked
      granted = await chrome.permissions.request permissions
      if not granted
        checkbox.checked = false
    else await chrome.permissions.remove permissions

window.onload = ->
  enableWebwork = document.querySelector '#enableWebwork'
  permissions =
    permissions: ['scripting', 'tabs']
    origins: ['http://*/*', 'https://*/*']
  handlePermissions enableWebwork, permissions

  enableGoogleForms = document.querySelector '#enableGoogleForms'
  permissions =
    permissions: ['scripting', 'tabs', 'webNavigation']
    origins: ['http://docs.google.com/*', 'https://docs.google.com/*']
  handlePermissions enableGoogleForms, permissions
