window.onload = ->
  enableWebwork = document.getElementById('enable-webwork')
  permissions =
    permissions: ["tabs"]
    origins: ["http://*/*", "https://*/*"]

  chrome.permissions.contains permissions, (result) ->
    if result
      enableWebwork.checked = true

  enableWebwork.onclick = ->
    if enableWebwork.checked
      chrome.permissions.request permissions, (granted) ->
        if not granted
          enableWebwork.checked = false
    else
      chrome.permissions.remove permissions
