// Generated by CoffeeScript 1.8.0
(function() {
  var Equation, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Equation = (function() {
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
      'Sigma': '∑',
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
      'sqrt': '√',
      'int': '∫',
      'sum': '∑'
    };

    Equation.specialops = ['^', '_', '/', '√', '∫', '∑'];

    Equation.functions = ['exp', 'log', 'ln', 'sinc'];

    Equation.trigfunctions = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];

    (function() {
      var func, _i, _len, _ref, _results;
      _ref = Equation.trigfunctions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        func = _ref[_i];
        Equation.functions.push(func);
        Equation.functions.push("a" + func);
        Equation.functions.push("" + func + "h");
        _results.push(Equation.functions.push("a" + func + "h"));
      }
      return _results;
    })();

    Equation.funcops = Object.keys(Equation.opregex).concat(Equation.functions);

    Equation.filters = ['\\$', '\\{', '\\}', 'bo', 'it', 'bi', 'sc', 'fr', 'ov', 'table', 'text', 'html'];

    function Equation(inputBox, equationBox, resizeText, callback) {
      this.inputBox = inputBox;
      this.equationBox = equationBox;
      this.resizeText = resizeText != null ? resizeText : false;
      this.callback = callback != null ? callback : null;
      this.searchHandler = __bind(this.searchHandler, this);
      this.keyUpHandler = __bind(this.keyUpHandler, this);
      this.keyPressHandler = __bind(this.keyPressHandler, this);
      this.keyDownHandler = __bind(this.keyDownHandler, this);
      this.fontSize = parseFloat(this.equationBox.style.fontSize);
      this.message = this.equationBox.innerHTML;
      this.keys = [];
      this.powerTimeout = setTimeout((function() {}), 0);
      this.enable();
    }

    Equation.prototype.findAndReplace = function(string, object) {
      var i, j, regex;
      for (i in object) {
        j = object[i];
        regex = new RegExp(i, 'g');
        string = string.replace(regex, j);
      }
      return string;
    };

    Equation.prototype.findAllIndexes = function(source, find) {
      var i, result, _i, _ref;
      result = [];
      for (i = _i = 0, _ref = source.length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (source.slice(i, i + find.length) === find) {
          result.push(i);
        }
      }
      return result;
    };

    Equation.prototype.findBracket = function(string, startPos, opening) {
      var count, i, range, _i, _j, _k, _len, _ref, _results, _results1;
      if (opening == null) {
        opening = false;
      }
      count = 0;
      if (opening) {
        range = (function() {
          _results = [];
          for (var _i = startPos; startPos <= 0 ? _i <= 0 : _i >= 0; startPos <= 0 ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
      } else {
        range = (function() {
          _results1 = [];
          for (var _j = startPos, _ref = string.length; startPos <= _ref ? _j < _ref : _j > _ref; startPos <= _ref ? _j++ : _j--){ _results1.push(_j); }
          return _results1;
        }).apply(this);
      }
      for (_k = 0, _len = range.length; _k < _len; _k++) {
        i = range[_k];
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
    };

    Equation.prototype.parseMatrices = function(string) {
      var bracketEnd, c, idx, innerBracketStart, rowEnd, rowStart, rows, s, table, _i;
      s = string;
      for (idx = _i = s.length - 1; _i >= 0; idx = _i += -1) {
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
            table = "(\\table " + (rows.join(';')) + ")";
            s = s.slice(0, idx) + table + s.slice(bracketEnd + 1);
          }
        }
      }
      return s;
    };

    Equation.prototype.parseOverbars = function(string) {
      var bracketEnd, bracketStart, c, idx, s, _i;
      s = string;
      for (idx = _i = s.length - 1; _i >= 0; idx = _i += -1) {
        c = s[idx];
        if (s.slice(idx, idx + 2) === '^_' && idx > 0) {
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
              bracketStart -= 1;
            }
            s = "" + s.slice(0, bracketStart) + "(" + s.slice(bracketStart, bracketEnd - 1) + ")" + s.slice(bracketEnd - 1);
          }
          s = this.changeBrackets(s, bracketStart, bracketEnd, '\\ov');
        }
      }
      return s;
    };

    Equation.prototype.parseFunction = function(string, func) {
      var endPos, i, indexes, startPos, _i, _len, _ref, _ref1;
      indexes = this.findAllIndexes(string, func);
      _ref = indexes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        if (string[i - 1] === 'a' && (_ref1 = func.slice(0, 3), __indexOf.call(Equation.trigfunctions, _ref1) >= 0)) {
          continue;
        }
        startPos = i + func.length;
        if (string[startPos] === '(') {
          endPos = this.findBracket(string, startPos);
          if (endPos) {
            string = "" + (this.removeSlashes(string.slice(0, i))) + "{\\" + (this.removeSlashes(string.slice(i, +endPos + 1 || 9e9))) + "}" + string.slice(endPos + 1);
          } else {
            string = "" + (this.removeSlashes(string.slice(0, i))) + "{\\" + (this.removeSlashes(string.slice(i)));
          }
        }
      }
      return string;
    };

    Equation.prototype.parseOperator = function(string, op) {
      var args, argsList, endPos, hasPower, i, indexes, over, startPos, under, _i, _len, _ref;
      indexes = this.findAllIndexes(string, op);
      _ref = indexes.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        startPos = i + op.length;
        if (string[startPos] === '(') {
          endPos = this.findBracket(string, startPos);
          if (endPos) {
            hasPower = string[endPos + 1] === '^';
            if (op === 'lim') {
              string = this.changeBrackets(string, startPos, endPos, '↙');
            } else if (op === '∫' || op === '∑') {
              args = string.slice(startPos + 1, endPos);
              argsList = args.split(',');
              if (argsList.length === 2) {
                under = argsList[0], over = argsList[1];
                string = this.changeBrackets(string, startPos, endPos, '↙', "" + (this.removeSlashes(under)) + "}↖{" + over);
              }
            } else if (!((op === '/' || op === '^') && hasPower)) {
              string = this.changeBrackets(string, startPos, endPos);
              if (op === '√' && hasPower) {
                string = "" + (this.removeSlashes(string.slice(0, i))) + "{" + (this.removeSlashes(string.slice(i, +endPos + 1 || 9e9))) + "}" + string.slice(endPos + 1);
              }
            }
          }
        }
      }
      return string;
    };

    Equation.prototype.removeSlashes = function(string) {
      return string.replace(/[\s\\]+$/, '');
    };

    Equation.prototype.changeBrackets = function(string, startPos, endPos, prefix, middle) {
      var prev;
      if (prefix == null) {
        prefix = '';
      }
      if (middle == null) {
        middle = '';
      }
      if (!middle) {
        middle = string.slice(startPos + 1, endPos);
      }
      prev = this.removeSlashes("" + string.slice(0, startPos) + prefix);
      middle = this.removeSlashes(middle);
      return "" + prev + "{" + middle + "}" + string.slice(endPos + 1);
    };

    Equation.prototype.insertAtCursor = function(field, value, del) {
      var endPos, scrollTop, sel, startPos;
      if (del == null) {
        del = 0;
      }
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
        field.value = "" + field.value.slice(0, startPos) + value + field.value.slice(endPos, field.value.length);
        field.focus();
        field.selectionStart = startPos + value.length;
        field.selectionEnd = startPos + value.length;
        field.scrollTop = scrollTop;
      } else {
        field.value += value;
        field.focus();
      }
      return this.updateMath();
    };

    Equation.prototype.updateBox = function() {
      var char, i, length, power, startIdx, _i, _ref;
      if (this.keys) {
        length = this.keys.length;
        startIdx = 0;
        if (length > 1) {
          char = this.keys[length - 1];
          for (i = _i = _ref = length - 1; _i >= 0; i = _i += -1) {
            if (this.keys[i] !== char) {
              startIdx = i + 1;
              break;
            }
          }
          power = length - startIdx;
          if (power > 1) {
            this.insertAtCursor(this.inputBox, "" + char + "^" + power, power);
          }
        }
      }
      return this.keys = [];
    };

    Equation.prototype.updateMath = function() {
      var endPos, f, func, i, indexes, j, op, regex, size, startPos, token, tokens, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;
      value = this.removeSlashes(this.inputBox.value);
      _ref = Equation.filters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        regex = new RegExp("[\\s\\\\]*" + f, 'g');
        value = value.replace(regex, f);
      }
      value = this.findAndReplace(value, Equation.symbolregex);
      value = this.findAndReplace(value, Equation.symbol2regex);
      value = this.findAndReplace(value, Equation.letterregex);
      value = this.findAndReplace(value, Equation.letter2regex);
      value = this.findAndReplace(value, Equation.opregex);
      regex = new RegExp('/(d|∂)(x|y|z|t)', 'g');
      value = value.replace(regex, '/{$1$2}');
      _ref1 = Equation.functions;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        func = _ref1[_j];
        value = this.parseFunction(value, func);
      }
      value = this.parseOperator(value, 'lim');
      tokens = value.split(/\s/);
      for (i = _k = 0, _len2 = tokens.length; _k < _len2; i = ++_k) {
        token = tokens[i];
        if (token[0] === '\\') {
          tokens[i] = "" + token + " ";
        }
      }
      value = tokens.join('');
      if (value) {
        _ref2 = Equation.specialops;
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          op = _ref2[_l];
          value = this.parseOperator(value, op);
        }
        indexes = this.findAllIndexes(value, '/');
        for (_m = 0, _len4 = indexes.length; _m < _len4; _m++) {
          j = indexes[_m];
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
        value = value.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        if (this.resizeText) {
          if (value.length > 160) {
            size = this.fontSize - 1.2;
          } else if (value.length > 80) {
            size = this.fontSize - 0.8;
          } else if (value.length > 40) {
            size = this.fontSize - 0.4;
          } else {
            size = this.fontSize;
          }
          this.equationBox.style.fontSize = "" + size + "em";
        }
        this.equationBox.innerHTML = "$$" + value + "$$";
        M.parseMath(this.equationBox);
      } else {
        this.equationBox.innerHTML = this.message;
        this.equationBox.style.fontSize = "" + this.fontSize + "em";
      }
      if (this.callback) {
        return this.callback(this.inputBox.value);
      }
    };

    Equation.prototype.keyDownHandler = function(e) {
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
        this.insertAtCursor(this.inputBox, Equation.shortcuts[key]);
      }
      return setTimeout(((function(_this) {
        return function() {
          return _this.updateMath();
        };
      })(this)), 0);
    };

    Equation.prototype.keyPressHandler = function(e) {
      var bracketsNo, i, key, startPos, value, _i, _len;
      key = String.fromCharCode(e.which);
      if (/[A-Za-z]/.test(key) && !(e.altKey || e.ctrlKey || e.metaKey)) {
        clearTimeout(this.powerTimeout);
        this.powerTimeout = setTimeout(((function(_this) {
          return function() {
            return _this.updateBox();
          };
        })(this)), 300);
        return this.keys.push(key);
      } else if (key in Equation.shortcuts || key === '}') {
        e.preventDefault();
        e.stopPropagation();
        if (key === '}') {
          startPos = this.inputBox.selectionStart;
          value = this.inputBox.value.slice(0, startPos);
          bracketsNo = 0;
          for (_i = 0, _len = value.length; _i < _len; _i++) {
            i = value[_i];
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
    };

    Equation.prototype.keyUpHandler = function(e) {
      var _ref;
      if ((65 <= (_ref = e.keyCode) && _ref <= 90) && this.needBracket()) {
        return this.insertAtCursor(this.inputBox, '(');
      }
    };

    Equation.prototype.searchHandler = function() {
      if (!this.inputBox.value) {
        return this.equationBox.innerHTML = this.message;
      }
    };

    Equation.prototype.enableShortcuts = function() {
      this.inputBox.addEventListener('keydown', this.keyDownHandler, false);
      this.inputBox.addEventListener('keypress', this.keyPressHandler, false);
      return this.inputBox.addEventListener('keyup', this.keyUpHandler, false);
    };

    Equation.prototype.disableShortcuts = function() {
      this.inputBox.removeEventListener('keydown', this.keyDownHandler, false);
      this.inputBox.removeEventListener('keypress', this.keyPressHandler, false);
      return this.inputBox.removeEventListener('keyup', this.keyUpHandler, false);
    };

    Equation.prototype.enable = function() {
      this.enableShortcuts();
      this.inputBox.addEventListener('search', this.searchHandler, false);
      return this.updateMath();
    };

    Equation.prototype.disable = function() {
      this.disableShortcuts();
      this.inputBox.removeEventListener('search', this.searchHandler, false);
      return this.equationBox.innerHTML = this.message;
    };

    Equation.prototype.needBracket = function() {
      var f, startPos, string, _i, _len, _ref;
      startPos = this.inputBox.selectionStart;
      _ref = Equation.funcops;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        string = this.inputBox.value.slice(startPos - f.length, startPos);
        if (string === f) {
          return true;
        }
      }
    };

    return Equation;

  })();

  root.Equation = Equation;

}).call(this);

//# sourceMappingURL=equations.js.map
