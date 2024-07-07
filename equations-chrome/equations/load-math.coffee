css = ['vendor/jqmath-0.4.3.css']
js = [
  'vendor/jquery-3.6.0.min.js',
  'vendor/jqmath-etc-0.4.6.min.js',
  'equation.js'
]

for file in css
  link = document.createElement 'link'
  link.href = chrome.runtime.getURL file
  link.type = 'text/css'
  link.rel = 'stylesheet'
  document.getElementsByTagName('head')[0].appendChild link

style = document.createElement 'style'
style.appendChild document.createTextNode 'fmath.ma-block { text-align: left }'
document.getElementsByTagName('head')[0].appendChild style

window.exports = window
for file in js
  await import(chrome.runtime.getURL file)

# Seems necessary to make await work
export default null
