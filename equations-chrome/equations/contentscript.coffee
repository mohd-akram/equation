inputBox = document.getElementById('i')

div = document.createElement('div')
div.id = 'equationBox-checkbox'
imgURL = chrome.extension.getURL("icon.png")
div.innerHTML = '<a id="equationsEnabled"><img src="'+imgURL+'" alt="Quick Equations"></a>'
optionsDiv = document.getElementById('moreInput')
optionsDiv.appendChild(div)

checkbox = document.getElementById('equationsEnabled')

checkbox.onclick = ->
  if not document.getElementById('equationBox-wolfram')
    equationBox = document.createElement('div')
    equationBox.id = 'equationBox-wolfram'
    wolframBox = document.getElementById('calculatecontain')
    wolframBox.appendChild(equationBox)
    startEquations(inputBox,document.getElementById('equationBox-wolfram'),"Type an equation above")
  else
    equationBox = document.getElementById('equationBox-wolfram')
    startEquations(inputBox,equationBox)
    parent = document.getElementById('calculatecontain')
    parent.removeChild(equationBox)
