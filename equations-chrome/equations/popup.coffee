window.onload = ->
  inputBox = document.getElementById('inputBox')
  equationBox = document.getElementById('equationBox')

  chrome.storage.sync.get 'equation', (items) ->
    if items.equation
      inputBox.value = items.equation

    equation = new Equation(inputBox, equationBox, false, ->
      chrome.storage.sync.set({'equation': inputBox.value}))

    inputBox.onsearch  = ->
      if inputBox.value
        url = "http://www.wolframalpha.com/input/?i=#{
              encodeURIComponent(inputBox.value)}"
        chrome.tabs.create({url: url})
      else
        equationBox.innerHTML = equation.message
