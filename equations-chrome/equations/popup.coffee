M.MathML = false
window.onload = ->
  inputBox = document.getElementById('inputBox')
  equationBox = document.getElementById('equationBox')
  message = equationBox.innerHTML
  startEquations(inputBox,equationBox,message,true)

  inputBox.onsearch  = ->
    if inputBox.value
      url = "http://www.wolframalpha.com/input/?i=
#{encodeURIComponent(inputBox.value)}"
      chrome.tabs.create({url: url})
    else
      equationBox.innerHTML = message
