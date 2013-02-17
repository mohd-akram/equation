// Generated by CoffeeScript 1.4.0
(function() {

  window.onload = function() {
    var changeBrackets, chars, equationBox, findAllIndexes, findAndReplace, findBracket, fontSize, funcregex, functions, i, inputBox, insertAtCursor, keyCodeMap, keys, lettersregex, message, miscregex, needBracket, timeout, trigfunctions, trigregex, updateBox, updateMath, _i, _len;
    inputBox = document.getElementById('inputBox');
    equationBox = document.getElementById('equationBox');
    fontSize = parseFloat(equationBox.style.fontSize);
    message = equationBox.innerHTML;
    keyCodeMap = {
      8: "backspace",
      38: "up",
      40: "down",
      59: ";",
      186: ";",
      192: '`',
      219: "[",
      221: "]",
      222: "'"
    };
    chars = {
      '[': '(',
      ']': ')',
      "'": '*',
      ';': '+',
      '`': "'",
      'up': '^(',
      'down': '_'
    };
    lettersregex = {
      'alpha': 'α',
      'beta': 'β',
      'gamma': 'γ',
      'delta': 'δ',
      'Delta': 'Δ',
      'epsilon': 'ε',
      'lambda': 'λ',
      'mu': 'μ',
      'pi': 'π',
      'theta': 'θ',
      'sigma': 'σ',
      'Sigma': '∑',
      'tau': 'τ',
      'omega': 'ω',
      'Omega': 'Ω',
      'inf': '\∞'
    };
    trigfunctions = ['sin', 'cos', 'tan'];
    funcregex = {
      'exp': '\exp',
      'log': '\log',
      'sqrt': '√',
      'int': '∫',
      'lim': '\lim',
      'sum': '∑'
    };
    miscregex = {
      '===': '≡',
      '<-': '←',
      '->': '→',
      '<==': '⇐',
      '==>': '⇒',
      '<=': '≤',
      '>=': '≥',
      '!=': '≠',
      '!<': '≮',
      '!>': '≯',
      '\\+-': '±',
      '\\*': '×'
    };
    functions = trigfunctions;
    for (i in funcregex) {
      functions.push(i);
    }
    trigregex = {};
    for (_i = 0, _len = trigfunctions.length; _i < _len; _i++) {
      i = trigfunctions[_i];
      trigregex['(arc)?' + i + '(h)?'] = '\\' + '$1' + i + '$2';
    }
    findAndReplace = function(string, object) {
      var j, regex;
      for (i in object) {
        j = object[i];
        regex = new RegExp(i, "g");
        string = string.replace(regex, j);
      }
      return string;
    };
    findAllIndexes = function(source, find) {
      var result, _j, _ref;
      result = [];
      for (i = _j = 0, _ref = source.length - 1; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        if (source.slice(i, i + find.length) === find) {
          result.push(i);
        }
      }
      return result;
    };
    findBracket = function(string, startPos, opening) {
      var count, range, _j, _k, _l, _len1, _ref, _results, _results1;
      if (opening == null) {
        opening = false;
      }
      count = 0;
      if (opening) {
        range = (function() {
          _results = [];
          for (var _j = startPos; startPos <= -1 ? _j < -1 : _j > -1; startPos <= -1 ? _j++ : _j--){ _results.push(_j); }
          return _results;
        }).apply(this);
      } else {
        range = (function() {
          _results1 = [];
          for (var _k = startPos, _ref = string.length; startPos <= _ref ? _k < _ref : _k > _ref; startPos <= _ref ? _k++ : _k--){ _results1.push(_k); }
          return _results1;
        }).apply(this);
      }
      for (_l = 0, _len1 = range.length; _l < _len1; _l++) {
        i = range[_l];
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
    changeBrackets = function(string, startPos, endPos, prefix, middle) {
      if (prefix == null) {
        prefix = '';
      }
      if (middle == null) {
        middle = '';
      }
      if (!middle) {
        middle = string.slice(startPos + 1, endPos);
      }
      string = string.slice(0, startPos) + prefix + '{' + middle + '}' + string.slice(endPos + 1);
      return string;
    };
    String.prototype.repeat = function(num) {
      return new Array(num + 1).join(this);
    };
    insertAtCursor = function(field, value, del) {
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
        field.value = "" + field.value.slice(0, startPos) + "" + value + "" + field.value.slice(endPos, field.value.length);
        field.focus();
        field.selectionStart = startPos + value.length;
        field.selectionEnd = startPos + value.length;
        field.scrollTop = scrollTop;
      } else {
        field.value += value;
        field.focus();
      }
      return updateMath();
    };
    keys = [];
    updateBox = function() {
      var char, length, power, startIdx, _j, _ref;
      if (keys) {
        length = keys.length;
        startIdx = 0;
        if (length > 1) {
          char = keys[length - 1];
          for (i = _j = _ref = length - 1; _j > -1; i = _j += -1) {
            if (keys[i] !== char) {
              startIdx = i + 1;
              break;
            }
          }
          power = length - startIdx;
          if (power > 1) {
            insertAtCursor(inputBox, char + '^' + power.toString(), power);
          }
        }
      }
      return keys = [];
    };
    updateMath = function() {
      var args, argsList, endPos, func, indexes, j, opening, over, size, startPos, under, value, _j, _k, _l, _len1, _len2, _len3, _ref, _ref1;
      value = inputBox.value.replace(/\\html/g, '').replace(/^\s+/, '').replace(/[\s\\]+$/, '');
      if (value) {
        _ref = ['sqrt', '^', '/', 'lim', 'int', 'sum'];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          func = _ref[_j];
          indexes = findAllIndexes(value, func);
          _ref1 = indexes.reverse();
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            i = _ref1[_k];
            startPos = i + func.length;
            if (value[startPos] === '(') {
              endPos = findBracket(value, startPos);
              if (endPos) {
                if (func === 'lim') {
                  value = changeBrackets(value, startPos, endPos, '↙');
                } else if (func === 'int' || func === 'sum') {
                  args = value.slice(startPos + 1, endPos);
                  argsList = args.split(',');
                  if (argsList.length === 2) {
                    under = argsList[0], over = argsList[1];
                    value = changeBrackets(value, startPos, endPos, '↙', under + '}↖{' + over);
                  }
                } else {
                  value = changeBrackets(value, startPos, endPos);
                }
              }
            }
          }
        }
        indexes = findAllIndexes(value, '/');
        for (_l = 0, _len3 = indexes.length; _l < _len3; _l++) {
          j = indexes[_l];
          if (value[j - 1] === ')') {
            endPos = j - 1;
            startPos = findBracket(value, endPos, opening = true);
            if (endPos) {
              value = changeBrackets(value, startPos, endPos);
            }
          }
        }
        value = findAndReplace(value, funcregex);
        value = findAndReplace(value, lettersregex);
        value = findAndReplace(value, trigregex);
        value = findAndReplace(value, miscregex);
        value = value.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        if (value.length > 160) {
          size = fontSize - 1.2;
        } else if (value.length > 80) {
          size = fontSize - 0.8;
        } else if (value.length > 40) {
          size = fontSize - 0.4;
        } else {
          size = fontSize;
        }
        equationBox.style.fontSize = size.toString() + 'em';
        equationBox.innerHTML = '\$\$' + value + '\$\$';
        return M.parseMath(equationBox);
      } else {
        equationBox.innerHTML = message;
        return equationBox.style.fontSize = fontSize.toString() + 'em';
      }
    };
    updateMath();
    needBracket = function() {
      var f, startPos, string, _j, _k, _len1, _len2;
      startPos = inputBox.selectionStart;
      for (_j = 0, _len1 = trigfunctions.length; _j < _len1; _j++) {
        f = trigfunctions[_j];
        string = inputBox.value.slice(startPos - (f.length + 1), startPos);
        if (string === f + 'h') {
          return true;
        }
      }
      for (_k = 0, _len2 = functions.length; _k < _len2; _k++) {
        f = functions[_k];
        string = inputBox.value.slice(startPos - f.length, startPos);
        if (string === f) {
          return true;
        }
      }
    };
    timeout = setTimeout((function() {}), 0);
    inputBox.onkeydown = function(event) {
      var bracketsNo, char, key, keyCode, startPos, value, _j, _len1;
      keyCode = event.keyCode;
      key = String.fromCharCode(keyCode).toLowerCase();
      if (keyCode >= 65 && keyCode <= 90) {
        clearTimeout(timeout);
        timeout = setTimeout((function() {
          return updateBox();
        }), 300);
        keys.push(key);
      }
      char = keyCodeMap[event.keyCode];
      if (char in chars) {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey && keyCodeMap[event.keyCode] === ']') {
          startPos = inputBox.selectionStart;
          value = inputBox.value.slice(0, startPos);
          bracketsNo = 0;
          for (_j = 0, _len1 = value.length; _j < _len1; _j++) {
            i = value[_j];
            if (i === '(') {
              bracketsNo += 1;
            }
            if (i === ')') {
              bracketsNo -= 1;
            }
          }
          if (bracketsNo > 0) {
            return insertAtCursor(inputBox, ')'.repeat(bracketsNo));
          }
        } else {
          return insertAtCursor(inputBox, chars[char]);
        }
      }
    };
    inputBox.onkeyup = function(event) {
      var keyCode;
      keyCode = event.keyCode;
      if (keyCode >= 65 && keyCode <= 90) {
        if (needBracket()) {
          insertAtCursor(inputBox, '(');
        }
      }
      return updateMath();
    };
    return inputBox.onsearch = function() {
      if (!inputBox.value) {
        return equationBox.innerHTML = message;
      }
    };
  };

}).call(this);
