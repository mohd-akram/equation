button = document.createElement 'button'
imgURL = chrome.extension.getURL 'icon.png'

button.innerHTML = "<img src=\"#{imgURL}\" alt=\"Quick Equations\">"

observer = new MutationObserver (mutations) ->
  optionsDiv = null
  for mutation in mutations
    optionsDiv = mutation.target.querySelector '.input-bottom-buttons'
    break if optionsDiv
  if optionsDiv
    optionsDiv.appendChild button
    observer.disconnect()
observer.observe document.body, childList: true

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
