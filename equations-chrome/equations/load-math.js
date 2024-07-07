// Generated by CoffeeScript 2.7.0
var css, file, i, j, js, len, len1, link, style;

css = ['vendor/jqmath-0.4.3.css'];

js = ['vendor/jquery-3.6.0.min.js', 'vendor/jqmath-etc-0.4.6.min.js', 'equation.js'];

for (i = 0, len = css.length; i < len; i++) {
  file = css[i];
  link = document.createElement('link');
  link.href = chrome.runtime.getURL(file);
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link);
}

style = document.createElement('style');

style.appendChild(document.createTextNode('fmath.ma-block { text-align: left }'));

document.getElementsByTagName('head')[0].appendChild(style);

window.exports = window;

for (j = 0, len1 = js.length; j < len1; j++) {
  file = js[j];
  await import(chrome.runtime.getURL(file));
}

// Seems necessary to make await work
export default null;

//# sourceMappingURL=load-math.js.map
