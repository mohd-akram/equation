window.onload = ->
  inputBox = document.getElementById 'inputBox'
  equationBox = document.getElementById 'equationBox'

  chrome.storage.sync.get 'equation', (items) ->
    if items.equation
      inputBox.value = items.equation

    timeout = null
    equation = new Equation inputBox, equationBox, false, ->
      clearTimeout timeout if timeout
      timeout = setTimeout ->
        timeout = null
        chrome.storage.sync.set equation: inputBox.value
      , if timeout then 10 else 0

    inputBox.onsearch = ->
      if inputBox.value
        url = "https://www.wolframalpha.com/input/?i=#{
              encodeURIComponent inputBox.value}"
        chrome.tabs.create url: url
