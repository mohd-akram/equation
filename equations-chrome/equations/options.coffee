handlePermissions = (checkbox, permissions) ->
  chrome.permissions.contains permissions, (result) ->
    if result
      checkbox.checked = true

  checkbox.onclick = ->
    if checkbox.checked
      chrome.permissions.request permissions, (granted) ->
        if not granted
          checkbox.checked = false
    else chrome.permissions.remove permissions

window.onload = ->
  enableWebwork = document.querySelector '#enableWebwork'
  permissions =
    permissions: ['tabs']
    origins: ['http://*/*', 'https://*/*']
  handlePermissions enableWebwork, permissions

  enableGoogleForms = document.querySelector '#enableGoogleForms'
  permissions =
    permissions: ['tabs', 'webNavigation']
    origins: ['http://docs.google.com/*', 'https://docs.google.com/*']
  handlePermissions enableGoogleForms, permissions
