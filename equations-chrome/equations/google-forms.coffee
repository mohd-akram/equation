imgURL = chrome.runtime.getURL 'icon.png'

className = 'qe-input-box'

inputBoxes = window.inputBoxes ? []

removeOldEquations = (equations) ->
  month = 30 * 24 * 60 * 60 * 1000
  now = Date.now()
  for equation of equations
    delete equations[equation] if now - equations[equation] > month

rememberEquation = (equation) ->
  items = await chrome.storage.sync.get 'knownEquations'
  knownEquations = items.knownEquations ? {}
  removeOldEquations knownEquations
  knownEquations[equation] = Date.now()
  await chrome.storage.sync.set knownEquations: knownEquations

forgetEquation = (equation) ->
  items = await chrome.storage.sync.get 'knownEquations'
  knownEquations = items.knownEquations ? {}
  removeOldEquations knownEquations
  delete knownEquations[equation]
  await chrome.storage.sync.set knownEquations: knownEquations

knownEquation = (equation) ->
  items = await chrome.storage.sync.get 'knownEquations'
  knownEquations = items.knownEquations ? {}
  equation of knownEquations

enableInputBox = (element) ->
  return if not element or element.classList.contains className
  wrapper = if element.tagName is 'DIV' then element else
    element.parentNode.closest '[jsname]'
  return unless wrapper

  element.classList.add className

  image = document.createElement 'img'
  image.src = imgURL
  image.style.display = 'block'

  button = document.createElement 'button'
  button.type = 'button'
  button.tabIndex = -1
  button.style.background = 'none'
  button.style.border = 'none'
  button.style.cursor = 'pointer'
  button.style.padding = '0'

  button.appendChild image

  # Avoid highlighting input element on click
  button.onmousedown = (e) -> e.preventDefault()

  elementValue = -> element.value ? element.textContent

  equation = null
  equationBox = null

  isInput = element.tagName in ['INPUT', 'TEXTAREA']

  show = ->
    rememberEquation elementValue()
    equationBox = document.createElement 'div'
    equationBox.classList.add className
    equationBox.style.marginTop = '5px'
    equationBox.style.fontSize = '1.5em'
    wrapper.parentNode.insertBefore equationBox, wrapper
    if isInput
      inputBox = element
    else
      inputBox = document.createElement 'textarea'
      inputBox.value = elementValue()
    equation = new Equation inputBox, equationBox

  hide = ->
    equation.disable()
    equation = null
    equationBox.remove()
    equationBox = null
    forgetEquation elementValue()

  button.onclick = ->
    return hide() if equation
    show()
    element.focus() if element.tagName in ['INPUT', 'TEXTAREA']

  known = await knownEquation elementValue()
  show() if known

  if isInput
    element.parentNode.insertBefore button, element.nextSibling
  else
    button.style.float = 'right'
    element.appendChild button

enableInputBox inputBox for inputBox in inputBoxes

observer = new MutationObserver () ->
  inputBoxes = document.querySelectorAll '
    [data-response] input[data-initial-value],
    [data-response] textarea[data-initial-value],
    div:has(+[data-noresponses]) > div > div
  '
  for inputBox in inputBoxes
    inputBox.style.display = 'inline-block' unless inputBox.tagName is 'DIV'
    enableInputBox inputBox

observer.observe document.body, childList: true, subtree: true

createDataTransfer = (url, name) ->
  parts = url.split ','
  type = parts[0].split(':')[1].split(';')[0]
  data = Uint8Array.from atob(parts[1]), (c) -> c.charCodeAt 0
  file = new File [data], name, type: type
  dt = new DataTransfer
  dt.items.add file
  dt

imageToDataURL = (img, width, height) ->
  canvas = document.createElement 'canvas'
  ctx = canvas.getContext '2d'

  canvas.width = width
  canvas.height = height

  ctx.drawImage img, 0, 0, width, height

  canvas.toDataURL()

picker = Array.from(document.querySelectorAll('[jsaction*=drop]')).pop()

if picker
  picker.addEventListener 'drop', (e) ->
    e.preventDefault()
    url = e.dataTransfer.getData 'text/uri-list'
    return unless url.startsWith 'data:image/png;base64,'
    img = document.createElement 'img'
    img.onload = ->
      url = imageToDataURL img, img.width / 2, img.height / 2
      dt = createDataTransfer url, 'equation.png'
      input = picker.querySelector 'input[type=file]'
      input.files = dt.files
      input.dispatchEvent new Event 'change', bubbles: true
    img.src = url
