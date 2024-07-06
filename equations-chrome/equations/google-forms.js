// Generated by CoffeeScript 2.5.1
(function() {
  var className, createDataTransfer, enableInputBox, forgetEquation, i, imageToDataURL, imgURL, inputBox, inputBoxes, knownEquation, len, observer, picker, ref, rememberEquation, removeOldEquations;

  imgURL = chrome.runtime.getURL('icon.png');

  className = 'qe-input-box';

  inputBoxes = (ref = window.inputBoxes) != null ? ref : [];

  removeOldEquations = function(equations) {
    var equation, month, now, results;
    month = 30 * 24 * 60 * 60 * 1000;
    now = Date.now();
    results = [];
    for (equation in equations) {
      if (now - equations[equation] > month) {
        results.push(delete equations[equation]);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  rememberEquation = async function(equation) {
    var items, knownEquations, ref1;
    items = (await chrome.storage.sync.get('knownEquations'));
    knownEquations = (ref1 = items.knownEquations) != null ? ref1 : {};
    removeOldEquations(knownEquations);
    knownEquations[equation] = Date.now();
    return (await chrome.storage.sync.set({
      knownEquations: knownEquations
    }));
  };

  forgetEquation = async function(equation) {
    var items, knownEquations, ref1;
    items = (await chrome.storage.sync.get('knownEquations'));
    knownEquations = (ref1 = items.knownEquations) != null ? ref1 : {};
    removeOldEquations(knownEquations);
    delete knownEquations[equation];
    return (await chrome.storage.sync.set({
      knownEquations: knownEquations
    }));
  };

  knownEquation = async function(equation) {
    var items, knownEquations, ref1;
    items = (await chrome.storage.sync.get('knownEquations'));
    knownEquations = (ref1 = items.knownEquations) != null ? ref1 : {};
    return equation in knownEquations;
  };

  enableInputBox = async function(element) {
    var button, elementValue, equation, equationBox, hide, image, isInput, known, ref1, show, wrapper;
    if (!element || element.classList.contains(className)) {
      return;
    }
    wrapper = element.closest('.freebirdFormviewerComponentsQuestionTextRoot, .freebirdFormviewerViewItemsTextTextItemContainer');
    if (!wrapper) {
      return;
    }
    element.classList.add(className);
    image = document.createElement('img');
    image.src = imgURL;
    image.style.display = 'block';
    button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.padding = '0';
    button.appendChild(image);
    // Avoid highlighting input element on click
    button.onmousedown = function(e) {
      return e.preventDefault();
    };
    elementValue = function() {
      var ref1;
      return (ref1 = element.value) != null ? ref1 : element.textContent;
    };
    equation = null;
    equationBox = null;
    isInput = (ref1 = element.tagName) === 'INPUT' || ref1 === 'TEXTAREA';
    show = function() {
      var inputBox;
      rememberEquation(elementValue());
      equationBox = document.createElement('div');
      equationBox.style.marginTop = '5px';
      equationBox.style.fontSize = '1.5em';
      wrapper.parentNode.insertBefore(equationBox, wrapper);
      if (isInput) {
        inputBox = element;
      } else {
        inputBox = document.createElement('textarea');
        inputBox.value = elementValue();
      }
      return equation = new Equation(inputBox, equationBox);
    };
    hide = function() {
      equation.disable();
      equation = null;
      equationBox.remove();
      equationBox = null;
      return forgetEquation(elementValue());
    };
    button.onclick = function() {
      var ref2;
      if (equation) {
        return hide();
      }
      show();
      if ((ref2 = element.tagName) === 'INPUT' || ref2 === 'TEXTAREA') {
        return element.focus();
      }
    };
    known = (await knownEquation(elementValue()));
    if (known) {
      show();
    }
    if (isInput) {
      return element.parentNode.insertBefore(button, element.nextSibling);
    } else {
      button.style.float = 'right';
      return element.appendChild(button);
    }
  };

  for (i = 0, len = inputBoxes.length; i < len; i++) {
    inputBox = inputBoxes[i];
    enableInputBox(inputBox);
  }

  observer = new MutationObserver(function(mutations) {
    var j, len1, mutation, results;
    results = [];
    for (j = 0, len1 = mutations.length; j < len1; j++) {
      mutation = mutations[j];
      inputBoxes = mutation.target.querySelectorAll('.quantumWizTextinputPaperinputInput, .quantumWizTextinputPapertextareaInput, .freebirdFormviewerViewItemsTextShortText, .freebirdFormviewerViewItemsTextLongText');
      results.push((function() {
        var k, len2, results1;
        results1 = [];
        for (k = 0, len2 = inputBoxes.length; k < len2; k++) {
          inputBox = inputBoxes[k];
          inputBox.style.display = 'inline-block';
          results1.push(enableInputBox(inputBox));
        }
        return results1;
      })());
    }
    return results;
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  createDataTransfer = function(url, name) {
    var data, dt, file, parts, type;
    parts = url.split(',');
    type = parts[0].split(':')[1].split(';')[0];
    data = Uint8Array.from(atob(parts[1]), function(c) {
      return c.charCodeAt(0);
    });
    file = new File([data], name, {
      type: type
    });
    dt = new DataTransfer();
    dt.items.add(file);
    return dt;
  };

  imageToDataURL = function(img, width, height) {
    var canvas, ctx;
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL();
  };

  picker = Array.from(document.querySelectorAll('[jsaction*=drop]')).pop();

  if (picker) {
    picker.addEventListener('drop', function(e) {
      var img, url;
      e.preventDefault();
      url = e.dataTransfer.getData('text/uri-list');
      if (!url.startsWith('data:image/png;base64,')) {
        return;
      }
      img = document.createElement('img');
      img.onload = function() {
        var dt, input;
        url = imageToDataURL(img, img.width / 2, img.height / 2);
        dt = createDataTransfer(url, 'equation.png');
        input = picker.querySelector('input[type=file]');
        input.files = dt.files;
        return input.dispatchEvent(new Event('change', {
          bubbles: true
        }));
      };
      return img.src = url;
    });
  }

}).call(this);

//# sourceMappingURL=google-forms.js.map
