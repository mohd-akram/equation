imgURL = chrome.extension.getURL 'icon.png'

className = 'qe-input-box'

inputBoxes = window.inputBoxes || []

responseClassName = 'freebirdFormeditorViewResponsesQuestionviewItemsShortText'

enableInputBox = (element) ->
  return unless element
  wrapper = element.closest '
    .freebirdFormviewerViewItemsTextItemWrapper,
    .freebirdFormeditorViewResponsesQuestionviewQuestionAnswerPreview
  '
  return unless wrapper
  return if (
    element.classList.contains(className) or
    element.getElementsByClassName(className).length
  )

  element.classList.add className

  image = document.createElement 'img'
  image.src = imgURL
  image.style.display = 'block'

  button = document.createElement 'button'
  button.style.background = 'none'
  button.style.border = 'none'
  button.style.cursor = 'pointer'
  button.style.padding = '0'
  button.style.marginLeft = '5px'

  button.appendChild image

  equation = null
  equationBox = null

  button.onclick = ->
    if equation
      equation.disable()
      equation = null
      equationBox.remove()
      equationBox = null
      return
    equationBox = document.createElement 'div'
    equationBox.style.display = 'inline-block'
    equationBox.style.marginTop = '5px'
    equationBox.style.fontSize = '1.5em'
    if element.classList.contains responseClassName
      equationBox.style.paddingTop = '20px'
      equationBox.style.paddingLeft = '36px'
    wrapper.parentNode.insertBefore equationBox, wrapper
    if element.tagName is 'INPUT'
      inputBox = element
    else
      value = element.innerText
      inputBox = document.createElement 'input'
      inputBox.value = value
    equation = new Equation inputBox, equationBox

  element.parentNode.insertBefore button, element.nextSibling

enableInputBox inputBox for inputBox in inputBoxes

observer = new MutationObserver (mutations) ->
  for mutation in mutations
    inputBox = mutation.target.querySelector? "
      .freebirdFormviewerViewItemsTextShortText,
      .#{responseClassName}
    "
    if inputBox
      inputBox.style.display = 'inline-block'
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

picker = document.querySelector('#doclist')?.querySelector 'div'

if picker
  picker.addEventListener 'drop', (e) ->
    url = e.dataTransfer.getData 'text/uri-list'
    return unless url.startsWith 'data:image/png;base64,'
    img = document.createElement 'img'
    img.onload = ->
      url = imageToDataURL img, img.width / 2, img.height / 2
      dt = createDataTransfer url, 'equation.png'
      input = picker.querySelector 'input[type=file]'
      input.files = dt.files
    img.src = url
