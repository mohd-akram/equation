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
