// Generated by CoffeeScript 2.3.2
(function() {
  window.onload = function() {
    var equationBox, inputBox;
    inputBox = document.getElementById('inputBox');
    equationBox = document.getElementById('equationBox');
    return chrome.storage.sync.get('equation', function(items) {
      var equation, timeout;
      if (items.equation) {
        inputBox.value = items.equation;
      }
      timeout = null;
      equation = new Equation(inputBox, equationBox, false, function() {
        if (timeout) {
          clearTimeout(timeout);
        }
        return timeout = setTimeout(function() {
          timeout = null;
          return chrome.storage.sync.set({
            equation: inputBox.value
          });
        }, timeout ? 10 : 0);
      });
      return inputBox.onsearch = function() {
        var url;
        if (inputBox.value) {
          url = `https://www.wolframalpha.com/input/?i=${encodeURIComponent(inputBox.value)}`;
          return chrome.tabs.create({
            url: url
          });
        }
      };
    });
  };

}).call(this);

//# sourceMappingURL=popup.js.map
