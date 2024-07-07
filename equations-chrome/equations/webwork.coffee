inputBoxes = (
  if location.href.startsWith 'https://chrome.google.com/webstore' then null
  else document.querySelectorAll 'input[id*=AnSwEr]'
)

if inputBoxes
  await import(chrome.runtime.getURL 'load-math.js')

  for inputBox in inputBoxes
    parent = inputBox.parentNode

    equationBox = document.createElement 'div'
    equationBox.style.display = 'inline-block'
    equationBox.style.padding = '10px'

    parent.insertBefore(equationBox, inputBox)
    parent.insertBefore(document.createElement('br'), inputBox)
    parent.insertBefore(document.createElement('br'), equationBox)

    equation = new Equation(inputBox, equationBox)
