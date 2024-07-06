window.onload = ->
  inputBox = document.getElementById 'inputBox'
  equationBox = document.getElementById 'equationBox'

  items = await chrome.storage.sync.get 'equation'
  if items.equation
    inputBox.value = items.equation

  timeout = null
  equation = new Equation inputBox, equationBox, false, ->
    clearTimeout timeout if timeout
    timeout = setTimeout ->
      timeout = null
      await chrome.storage.sync.set equation: inputBox.value
    , if timeout then 10 else 0

  inputBox.onsearch = ->
    if inputBox.value
      url = "https://www.wolframalpha.com/input/?i=#{
            encodeURIComponent inputBox.value}"
      await chrome.tabs.create url: url
