// Generated by CoffeeScript 2.5.1
(function() {
  var button, equation, imgURL, observer;

  button = document.createElement('button');

  button.type = 'button';

  imgURL = chrome.extension.getURL('icon.png');

  button.innerHTML = `<img src=\"${imgURL}\" alt=\"Quick Equations\">`;

  observer = new MutationObserver(function(mutations) {
    var i, len, mutation, optionsDiv;
    optionsDiv = null;
    for (i = 0, len = mutations.length; i < len; i++) {
      mutation = mutations[i];
      optionsDiv = mutation.target.querySelector('.input-bottom-buttons');
      if (optionsDiv) {
        break;
      }
    }
    if (optionsDiv) {
      optionsDiv.appendChild(button);
      return observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true
  });

  equation = null;

  button.onclick = function(e) {
    var equationBox;
    equationBox = window.equationBox;
    if (!equationBox) {
      equationBox = document.createElement('div');
      equationBox.id = 'equationBox';
      equationBox.innerHTML = 'Type an equation above';
      view.insertBefore(equationBox, view.firstChild);
      equation = new Equation(query, equationBox);
    } else {
      equation.disable();
      view.removeChild(equationBox);
    }
    return e.preventDefault();
  };

}).call(this);

//# sourceMappingURL=wolfram.js.map
