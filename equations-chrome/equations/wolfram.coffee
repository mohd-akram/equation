button = document.createElement 'button'
imgURL = chrome.extension.getURL 'icon.png'

button.innerHTML = "<img src=\"#{imgURL}\" alt=\"Quick Equations\">"

setTimeout ->
  optionsDiv = document.getElementsByClassName('input-bottom-buttons')[0]
  optionsDiv.appendChild button
, 0

equation = null

button.onclick = (e) ->
  equationBox = window.equationBox
  if not equationBox
    equationBox = document.createElement 'div'
    equationBox.id = 'equationBox'
    equationBox.innerHTML = 'Type an equation above'
    view.insertBefore equationBox, view.firstChild
    equation = new Equation(query, equationBox)
  else
    equation.disable()
    view.removeChild equationBox
  e.preventDefault()
