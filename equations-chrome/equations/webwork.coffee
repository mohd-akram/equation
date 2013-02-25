for inputBox in inputBoxes
  parent = inputBox.parentNode

  equationBox = document.createElement('div')
  equationBox.style.display = 'inline-block'
  equationBox.style.padding = '10px'

  parent.insertBefore(equationBox, inputBox)
  parent.insertBefore(document.createElement('br'), inputBox)
  parent.insertBefore(document.createElement('br'), equationBox)
 
  startEquations(inputBox, equationBox)
