button = document.createElement 'button'
button.type = 'button'
button.id = 'quickEquations'

# wrap in a div because otherwise it gets mixed with another button
div = document.createElement 'div'
div.appendChild button

imgURL = chrome.extension.getURL 'icon.png'
img = document.createElement 'img'
img.src = imgURL
img.alt = 'Quick Equations'
button.appendChild img

observer = new MutationObserver ->
  return if document.querySelector '#quickEquations'
  buttons = document.querySelector('[href="/examples"]')?.closest('nav')
  if buttons
    button.classList.add c for c in buttons.querySelector('button').classList
    buttons.prepend div
observer.observe document.body, childList: true, subtree: true

equation = null

button.onclick = (e) ->
  equationBox = window.equationBox
  menu = button.closest('nav').parentElement
  view = menu.parentElement
  if not equationBox
    equationBox = document.createElement 'div'
    equationBox.id = 'equationBox'
    equationBox.innerHTML = 'Type an equation above'
    view.insertBefore equationBox, menu
    query = view.querySelector 'input'
    equation = new Equation(query, equationBox)
  else
    equation.disable()
    view.removeChild equationBox
  e.preventDefault()
