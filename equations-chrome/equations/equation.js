// Generated by CoffeeScript 2.5.1
(function() {
  var ElementImage, Equation, root,
    indexOf = [].indexOf;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  ElementImage = class ElementImage {
    constructor(element) {
      var style;
      this.update = this.update.bind(this);
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.element = element;
      this.elementDisplay = this.element.style.display;
      this.image = document.createElement('img');
      style = window.getComputedStyle(this.element);
      this.imageDisplay = style.display;
      this.image.style.verticalAlign = style.verticalAlign;
      this.image.style.display = 'none';
      this.element.parentNode.insertBefore(this.image, this.element);
      this.observer = new MutationObserver(this.update);
      this.observer.observe(this.element, {
        childList: true,
        subtree: true
      });
      this.element.addEventListener('mousedown', () => {
        if (this.image.src) {
          return this.show();
        }
      });
    }

    remove() {
      this.observer.disconnect();
      this.hide();
      return this.image.remove();
    }

    update() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      return this.timeout = setTimeout(() => {
        this.timeout = null;
        this.hide();
        return domtoimage.toPng(this.element).then((url) => {
          this.image.width = this.element.clientWidth;
          this.image.height = this.element.clientHeight;
          this.image.style.objectFit = 'cover';
          this.image.style.objectPosition = 'center 0';
          return this.image.src = url;
        });
      }, this.timeout ? 10 : 0);
    }

    show() {
      this.image.style.display = this.imageDisplay;
      return this.element.style.display = 'none';
    }

    hide() {
      this.image.style.display = 'none';
      return this.element.style.display = this.elementDisplay;
    }

  };

  Equation = (function() {
    class Equation {
      constructor(inputBox, equationBox, resizeText = false, callback = null) {
        var parent, ref;
        this.updateMath = this.updateMath.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyPressHandler = this.keyPressHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.searchHandler = this.searchHandler.bind(this);
        this.inputBox = inputBox;
        this.equationBox = equationBox;
        this.resizeText = resizeText;
        this.callback = callback;
        parent = this.equationBox;
        this.message = (ref = parent.firstChild) != null ? ref : document.createTextNode('');
        this.fontSize = parseFloat(window.getComputedStyle(parent).fontSize);
        this.equationBox = document.createElement('div');
        this.equationBox.style.display = 'inline-block';
        // Needed to avoid cut-off due to italics
        this.equationBox.style.padding = '0 0.2em';
        this.equationBox.style.verticalAlign = 'top';
        if (parent.firstChild) {
          parent.removeChild(parent.firstChild);
        }
        this.equationBox.appendChild(this.message);
        parent.appendChild(this.equationBox);
        // Initialize key buffer and timeout. Used for exponent/power shortcut.
        this.keys = [];
        this.powerTimeout = setTimeout((function() {}), 0);
        this.enable();
      }

      findAndReplace(string, object) {
        var i, j, regex;
        for (i in object) {
          j = object[i];
          regex = new RegExp(i, 'g');
          string = string.replace(regex, j);
        }
        return string;
      }

      findAllIndexes(source, find) {
        var i, k, ref, result;
        result = [];
        for (i = k = 0, ref = source.length - 1; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
          if (source.slice(i, i + find.length) === find) {
            result.push(i);
          }
        }
        return result;
      }

      findBracket(string, startPos, opening = false) {
        var count, i, k, len, range, ref;
        count = 0;
        if (opening) {
          range = (function() {
            var results = [];
            for (var k = startPos; startPos <= 0 ? k <= 0 : k >= 0; startPos <= 0 ? k++ : k--){ results.push(k); }
            return results;
          }).apply(this);
        } else {
          range = (function() {
            var results = [];
            for (var k = startPos, ref = string.length; startPos <= ref ? k < ref : k > ref; startPos <= ref ? k++ : k--){ results.push(k); }
            return results;
          }).apply(this);
        }
        for (k = 0, len = range.length; k < len; k++) {
          i = range[k];
          if (string[i] === '(') {
            count += 1;
          }
          if (string[i] === ')') {
            count -= 1;
          }
          if (count === 0) {
            return i;
          }
        }
      }

      parseMatrices(string) {
        var bracketEnd, c, idx, innerBracketStart, k, rowEnd, rowStart, rows, s, table;
        s = string;
        for (idx = k = s.length - 1; k >= 0; idx = k += -1) {
          c = s[idx];
          if (s.slice(idx, idx + 2) === '((') {
            bracketEnd = this.findBracket(s, idx);
            innerBracketStart = this.findBracket(s, bracketEnd - 1, true);
            if (s[innerBracketStart - 1] === ',' || innerBracketStart === idx + 1) {
              rows = [];
              rowStart = idx + 1;
              while (true) {
                rowEnd = this.findBracket(s, rowStart);
                rows.push(s.slice(rowStart + 1, rowEnd));
                if (s[rowEnd + 1] === ',') {
                  rowStart = rowEnd + 2;
                } else {
                  break;
                }
              }
              table = `(\\table ${rows.join(';')})`;
              s = s.slice(0, idx) + table + s.slice(bracketEnd + 1);
            }
          }
        }
        return s;
      }

      parseOverbars(string) {
        var bracketEnd, bracketStart, c, idx, k, s;
        s = string;
        for (idx = k = s.length - 1; k >= 0; idx = k += -1) {
          c = s[idx];
          if (s.slice(idx, idx + 2) === '^_' && idx > 0) {
            // Remove the overbar operator
            s = s.slice(0, idx) + s.slice(idx + 2);
            if (s[idx - 1] === ')') {
              bracketEnd = idx - 1;
              bracketStart = this.findBracket(s, bracketEnd, true);
              if (bracketStart == null) {
                continue;
              }
            } else {
              bracketEnd = idx + 1;
              bracketStart = idx - 1;
              while (bracketStart - 1 >= 0 && !isNaN(Number(s.slice(bracketStart - 1, idx)))) {
                // Place start bracket appropriately if number precedes operator
                bracketStart -= 1;
              }
              s = `${s.slice(0, bracketStart)}(${s.slice(bracketStart, bracketEnd - 1)})${s.slice(bracketEnd - 1)}`;
            }
            s = this.changeBrackets(s, bracketStart, bracketEnd, '\\ov');
          }
        }
        return s;
      }

      parseFunction(string, func) {
        var endPos, i, indexes, k, len, ref, ref1, startPos;
        indexes = this.findAllIndexes(string, func);
        ref = indexes.reverse();
        for (k = 0, len = ref.length; k < len; k++) {
          i = ref[k];
          // Workaround for asin, asinh, etc.
          if (string[i - 1] === 'a' && (ref1 = func.slice(0, 3), indexOf.call(Equation.trigfunctions, ref1) >= 0)) {
            continue;
          }
          startPos = i + func.length;
          if (string[startPos] === '(') {
            endPos = this.findBracket(string, startPos);
            // Wrap function
            if (endPos) {
              string = `${string.slice(0, i)}{\\${string.slice(i, +endPos + 1 || 9e9)}}${string.slice(endPos + 1)}`;
            } else {
              string = `${string.slice(0, i)}{\\${string.slice(i)}`;
            }
          }
        }
        return string;
      }

      parseOperator(string, op) {
        var args, argsList, endPos, hasPower, i, index, indexes, k, len, over, ref, startPos, under, value;
        indexes = this.findAllIndexes(string, op);
        ref = indexes.reverse();
        for (k = 0, len = ref.length; k < len; k++) {
          i = ref[k];
          startPos = i + op.length;
          if (string[startPos] === '(') {
            endPos = this.findBracket(string, startPos);
            if (endPos) {
              hasPower = string[endPos + 1] === '^';
              // Limit underscript adjustment
              if (op === 'lim') {
                string = this.changeBrackets(string, startPos, endPos, '↙');
              // Functions with overscript and underscript
              } else if (op === '∫' || op === '∑' || op === '∏' || op === '√^') {
                args = string.slice(startPos + 1, endPos);
                argsList = args.split(',');
                if (argsList.length === 2) {
                  if (op === '√^') {
                    [value, index] = argsList;
                    string = this.changeBrackets(string, startPos, endPos, '', `${index}}{${value}`);
                  } else {
                    [under, over] = argsList;
                    string = this.changeBrackets(string, startPos, endPos, '↙', `${under}}↖{${over}`);
                  }
                }
              // Change parentheses except for binary operators raised to a power
              } else if (!((op === '/' || op === '^') && hasPower)) {
                string = this.changeBrackets(string, startPos, endPos);
              }
              // Wrap root if followed by a power
              if ((op === '√' || op === '√^' || op === '√^3') && hasPower) {
                string = `${string.slice(0, i)}{${string.slice(i, +endPos + 1 || 9e9)}}${string.slice(endPos + 1)}`;
              }
            }
          }
        }
        return string;
      }

      changeBrackets(string, startPos, endPos, prefix = '', middle = '') {
        var prev;
        if (!middle) {
          middle = string.slice(startPos + 1, endPos);
        }
        prev = `${string.slice(0, startPos)}${prefix}`;
        return `${prev}{${middle}}${string.slice(endPos + 1)}`;
      }

      insertAtCursor(field, value, del = 0) {
        var endPos, scrollTop, sel, startPos;
        // If IE
        if (document.selection) {
          field.focus();
          sel = document.selection.createRange();
          if (del) {
            sel.moveStart('character', -del);
          }
          sel.text = value;
          field.focus();
        } else if (field.selectionStart || field.selectionStart === 0) {
          startPos = field.selectionStart - del;
          endPos = field.selectionEnd;
          scrollTop = field.scrollTop;
          field.value = `${field.value.slice(0, startPos)}${value}${field.value.slice(endPos, field.value.length)}`;
          field.focus();
          field.selectionStart = startPos + value.length;
          field.selectionEnd = startPos + value.length;
          field.scrollTop = scrollTop;
        } else {
          field.value += value;
          field.focus();
        }
        return field.dispatchEvent(new Event('input', {
          bubbles: true
        }));
      }

      updateBox() {
        var char, i, k, length, power, ref, startIdx;
        if (this.keys) {
          length = this.keys.length;
          startIdx = 0;
          if (length > 1) {
            char = this.keys[length - 1];
            for (i = k = ref = length - 1; k >= 0; i = k += -1) {
              if (this.keys[i] !== char) {
                startIdx = i + 1;
                break;
              }
            }
            power = length - startIdx;
            if (power > 1) {
              this.insertAtCursor(this.inputBox, `${char}^${power}`, power);
            }
          }
        }
        return this.keys = [];
      }

      updateMath() {
        var endPos, func, indexes, j, k, l, len, len1, len2, m, op, ref, ref1, regex, size, startPos, value;
        if (this.inputBox.value === this.value) {
          return;
        }
        this.value = this.inputBox.value;
        value = this.value;
        // Escape backslashes
        value = value.replace(/\\/g, "\\\\");
        // Display symbols, Greek letters and functions properly
        value = this.findAndReplace(value, Equation.symbolregex);
        value = this.findAndReplace(value, Equation.symbol2regex);
        value = this.findAndReplace(value, Equation.letterregex);
        value = this.findAndReplace(value, Equation.letter2regex);
        value = this.findAndReplace(value, Equation.opregex);
        // Allow d/dx without parentheses
        regex = new RegExp('/(d|∂)(x|y|z|t)', 'g');
        value = value.replace(regex, '/{$1$2}');
        ref = Equation.functions;
        // Parse functions
        for (k = 0, len = ref.length; k < len; k++) {
          func = ref[k];
          value = this.parseFunction(value, func);
        }
        value = this.parseOperator(value, 'lim');
        // Preserve newlines
        M.MathPlayer = false;
        M.trustHtml = true;
        value = value.replace(/\n/g, "\\html'<br>'");
        if (value) {
          ref1 = Equation.specialops;
          // Parse special operators
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            op = ref1[l];
            value = this.parseOperator(value, op);
          }
          // Remove parentheses before division sign
          indexes = this.findAllIndexes(value, '/');
          for (m = 0, len2 = indexes.length; m < len2; m++) {
            j = indexes[m];
            if (value[j - 1] === ')') {
              endPos = j - 1;
              startPos = this.findBracket(value, endPos, true);
              if (startPos != null) {
                value = this.changeBrackets(value, startPos, endPos);
              }
            }
          }
          value = this.parseOverbars(value);
          value = this.parseMatrices(value);
          if (this.resizeText) {
            // Resize to fit
            if (value.length > 160) {
              size = this.fontSize * 0.25;
            } else if (value.length > 80) {
              size = this.fontSize * 0.5;
            } else if (value.length > 40) {
              size = this.fontSize * 0.75;
            } else {
              size = this.fontSize;
            }
            this.equationBox.style.fontSize = `${size}px`;
          }
          this.equationBox.replaceChild(M.sToMathE(value), this.equationBox.firstChild);
        } else {
          this.equationBox.replaceChild(this.message, this.equationBox.firstChild);
          this.equationBox.style.fontSize = "";
        }
        if (this.callback) {
          return this.callback(this.inputBox.value);
        }
      }

      keyDownHandler(e) {
        var key;
        switch (e.keyCode) {
          case 38:
            key = 'up';
            break;
          case 40:
            key = 'down';
        }
        if (key != null) {
          e.preventDefault();
          e.stopPropagation();
          return this.insertAtCursor(this.inputBox, Equation.shortcuts[key]);
        }
      }

      keyPressHandler(e) {
        var bracketsNo, i, k, key, len, startPos, value;
        key = String.fromCharCode(e.which);
        if (/[A-Za-z]/.test(key) && !(e.altKey || e.ctrlKey || e.metaKey)) {
          clearTimeout(this.powerTimeout);
          this.powerTimeout = setTimeout((() => {
            return this.updateBox();
          }), 300);
          return this.keys.push(key);
        } else if (key in Equation.shortcuts || key === '}') {
          e.preventDefault();
          e.stopPropagation();
          // Close all brackets
          if (key === '}') {
            startPos = this.inputBox.selectionStart;
            value = this.inputBox.value.slice(0, startPos);
            bracketsNo = 0;
            for (k = 0, len = value.length; k < len; k++) {
              i = value[k];
              if (i === '(') {
                bracketsNo += 1;
              }
              if (i === ')') {
                bracketsNo -= 1;
              }
            }
            if (bracketsNo > 0) {
              return this.insertAtCursor(this.inputBox, new Array(bracketsNo + 1).join(')'));
            }
          } else {
            return this.insertAtCursor(this.inputBox, Equation.shortcuts[key]);
          }
        }
      }

      keyUpHandler(e) {
        var ref;
        // Add bracket after functions
        if ((65 <= (ref = e.keyCode) && ref <= 90) && this.needBracket()) {
          return this.insertAtCursor(this.inputBox, '(');
        }
      }

      searchHandler() {
        if (!this.inputBox.value) {
          return this.equationBox.replaceChild(this.message, this.equationBox.firstChild);
        }
      }

      enableShortcuts() {
        this.inputBox.addEventListener('keydown', this.keyDownHandler, false);
        this.inputBox.addEventListener('keypress', this.keyPressHandler, false);
        return this.inputBox.addEventListener('keyup', this.keyUpHandler, false);
      }

      disableShortcuts() {
        this.inputBox.removeEventListener('keydown', this.keyDownHandler, false);
        this.inputBox.removeEventListener('keypress', this.keyPressHandler, false);
        return this.inputBox.removeEventListener('keyup', this.keyUpHandler, false);
      }

      enable() {
        if (window.domtoimage) {
          this.equationImage = new ElementImage(this.equationBox);
        }
        this.enableShortcuts();
        this.inputBox.addEventListener('input', this.updateMath, false);
        this.inputBox.addEventListener('search', this.searchHandler, false);
        return this.updateMath();
      }

      disable() {
        if (this.equationImage) {
          this.equationImage.remove();
        }
        this.disableShortcuts();
        this.inputBox.removeEventListener('input', this.updateMath, false);
        this.inputBox.removeEventListener('search', this.searchHandler, false);
        return this.equationBox.replaceChild(this.message, this.equationBox.firstChild);
      }

      needBracket() {
        var f, k, len, ref, startPos, string;
        startPos = this.inputBox.selectionStart;
        ref = Equation.funcops;
        for (k = 0, len = ref.length; k < len; k++) {
          f = ref[k];
          string = this.inputBox.value.slice(startPos - f.length, startPos);
          if (string === f) {
            return true;
          }
        }
      }

    };

    Equation.shortcuts = {
      '[': '(',
      ']': ')',
      "'": '*',
      ';': '+',
      '`': "'",
      'up': '^(',
      'down': '_'
    };

    Equation.symbolregex = {
      '===': '≡',
      '~~': '≈',
      '!=': '≠',
      '=/=': '≠',
      '>=': '≥',
      '!<': '≮',
      '!>': '≯',
      '<-': '←',
      '->': '→',
      '<==': '⇐',
      '==>': '⇒',
      '\\+/-': '±',
      '\\*': '×',
      '\\^\\^': '\u0302'
    };

    Equation.symbol2regex = {
      '<=': '≤'
    };

    Equation.letterregex = {
      'Alpha': 'Α',
      'alpha': 'α',
      'Beta': 'Β',
      'beta': 'β',
      'Gamma': 'Γ',
      'gamma': 'γ',
      'Delta': 'Δ',
      'delta': 'δ',
      'Epsilon': 'Ε',
      'epsilon': 'ε',
      'Zeta': 'Ζ',
      'zeta': 'ζ',
      'Eta': 'Η',
      'Theta': 'Θ',
      'theta': 'θ',
      'Iota': 'Ι',
      'iota': 'ι',
      'Kappa': 'Κ',
      'kappa': 'κ',
      'Lambda': 'Λ',
      'lambda': 'λ',
      'Mu': 'Μ',
      'mu': 'μ',
      'Nu': 'Ν',
      'nu': 'ν',
      'Xi': 'Ξ',
      'xi': 'ξ',
      'Omicron': 'Ο',
      'omicron': 'ο',
      'Pi': 'Π',
      'pi': 'π',
      'Rho': 'Ρ',
      'rho': 'ρ',
      'Sigma': 'Σ',
      'sigma': 'σ',
      'Tau': 'Τ',
      'tau': 'τ',
      'Upsilon': 'Υ',
      'upsilon': 'υ',
      'Phi': 'Φ',
      'phi': 'φ',
      'Chi': 'Χ',
      'chi': 'χ',
      'Psi': 'Ψ',
      'Omega': 'Ω',
      'omega': 'ω',
      'inf': '∞'
    };

    Equation.letter2regex = {
      'eta': 'η',
      'psi': 'ψ',
      'del': '∇'
    };

    Equation.opregex = {
      'lim': '\\lim',
      'cbrt': '√^3',
      'root': '√^',
      'sqrt': '√',
      'int': '∫',
      'sum': '∑',
      'prod': '∏'
    };

    Equation.specialops = ['_', '/', '√^3', '√^', '√', '^', '∫', '∑', '∏'];

    Equation.functions = ['exp', 'log', 'ln', 'sinc'];

    Equation.trigfunctions = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];

    (function() {
      var func, k, len, ref, results;
      ref = this.trigfunctions;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        func = ref[k];
        this.functions.push(func);
        this.functions.push(`a${func}`);
        this.functions.push(`${func}h`);
        results.push(this.functions.push(`a${func}h`));
      }
      return results;
    }).bind(Equation)();

    Equation.funcops = Object.keys(Equation.opregex).concat(Equation.functions);

    return Equation;

  }).call(this);

  root.Equation = Equation;

}).call(this);

//# sourceMappingURL=equation.js.map
