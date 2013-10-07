inputBox = document.getElementById('i')

div = document.createElement('div')
div.id = 'equationBox-icon'
imgURL = chrome.extension.getURL("icon.png")

div.innerHTML = "<a id=\"equationsEnabled\">
<img src=\"#{imgURL}\" alt=\"Quick Equations\"></a>"

optionsDiv = document.getElementById('moreInput')
optionsDiv.appendChild(div)

wolframBox = document.getElementById('calculatecontain')
equationsIcon = document.getElementById('equationsEnabled')

equation = null

equationsIcon.onclick = ->
  equationBox = document.getElementById('equationBox-wolfram')
  if not equationBox
    equationBox = document.createElement('div')
    equationBox.id = 'equationBox-wolfram'
    equationBox.innerHTML = 'Type an equation above'
    wolframBox.appendChild(equationBox)
    equation = new Equation(inputBox, equationBox)
  else
    equation.disable()
    wolframBox.removeChild(equationBox)
