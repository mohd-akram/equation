inputBox = document.getElementById('i')

div = document.createElement('div')
div.id = 'equationBox-checkbox'
imgURL = chrome.extension.getURL("icon.png")

div.innerHTML = "<a id=\"equationsEnabled\">
<img src=\"#{imgURL}\" alt=\"Quick Equations\"></a>"

optionsDiv = document.getElementById('moreInput')
optionsDiv.appendChild(div)

checkbox = document.getElementById('equationsEnabled')

checkbox.onclick = ->
  equationBox = document.getElementById('equationBox-wolfram')
  if not equationBox
    equationBox = document.createElement('div')
    equationBox.id = 'equationBox-wolfram'
    wolframBox = document.getElementById('calculatecontain')
    wolframBox.appendChild(equationBox)
    startEquations(inputBox,equationBox,"Type an equation above")
  else
    stopEquations(inputBox,equationBox)
    parent = document.getElementById('calculatecontain')
    parent.removeChild(equationBox)
