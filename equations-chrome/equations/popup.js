// Generated by CoffeeScript 1.9.3
(function() {
  window.onload = function() {
    var equationBox, inputBox;
    inputBox = document.getElementById('inputBox');
    equationBox = document.getElementById('equationBox');
    return chrome.storage.sync.get('equation', function(items) {
      var equation;
      if (items.equation) {
        inputBox.value = items.equation;
      }
      equation = new Equation(inputBox, equationBox, false, function() {
        return chrome.storage.sync.set({
          equation: inputBox.value
        });
      });
      return inputBox.onsearch = function() {
        var url;
        if (inputBox.value) {
          url = "http://www.wolframalpha.com/input/?i=" + (encodeURIComponent(inputBox.value));
          return chrome.tabs.create({
            url: url
          });
        }
      };
    });
  };

}).call(this);

//# sourceMappingURL=popup.js.map
