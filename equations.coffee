window.onload = ->
  inputBox = document.getElementById('inputBox')
  equationBox = document.getElementById('equationBox')
  fontSize = parseFloat(equationBox.style.fontSize)
  message = equationBox.innerHTML

  keyCodeMap = {
    8:"backspace", 38:"up", 40:"down", 59:";", 186:";", 192:'`', 219:"[", 221:"]", 222:"'"
    }

  chars = {'[':'(',']':')',"'":'*',';':'+','`':"'",'up':'^(','down':'_'}
  lettersregex = {'alpha':'α','beta':'β','gamma':'γ','delta':'δ','Delta':'Δ','epsilon':'ε','lambda':'λ','mu':'μ','pi':'π','theta':'θ','sigma':'σ','Sigma':'∑','tau':'τ','omega':'ω','Omega':'Ω','inf':'\∞'}
  trigfunctions = ['sin','cos','tan']
  funcregex = {'exp':'\exp','log':'\log','sqrt':'√','integrate':'∫','[lL]aplace':'\\sc L','lim':'\lim'}
  miscregex = {'===':'≡','<-':'←','->':'→','<==':'⇐','==>':'⇒','<=':'≤','>=':'≥','!=':'≠','!<':'≮','!>':'≯','\\+-':'±','\\*':'×'}
  
  functions = trigfunctions
  
  for i of funcregex
    functions.push i

  trigregex = {}

  for i in trigfunctions
    trigregex['(arc)?'+i+'(h)?'] = '\\'+'$1'+i+'$2'
  
  findAndReplace = (string,object) ->
    for i,j of object
        regex = new RegExp(i,"g")
        string = string.replace(regex,j)
    return string

  findAllIndexes = (source, find) ->
    result = []
    for i in [0...source.length-1]
      if source.substring(i, i + find.length) == find
        result.push(i)

    return result
    
  findBracket = (string,startPos,opening=false) ->
    count = 0
    if opening
      range = [startPos...-1]
    else
      range = [startPos...string.length]

    for i in range
      if string[i] == '('
          count += 1
      if string[i] == ')'
          count -= 1

      if count==0
        return i

  changeBrackets = (string,startPos,endPos,prefix='') ->
    string = string[0...startPos]+prefix+'{'+string[startPos+1...endPos]+'}'+string[endPos+1...]
    return string

  String.prototype.repeat = (num) ->
    return new Array( num + 1 ).join( this )
 
  insertAtCursor = (field,value,del = 0) ->
    # If IE
    if document.selection
      field.focus()
      sel = document.selection.createRange()
      if del
        sel.moveStart('character',-del)
      sel.text = value
      field.focus()

    else if (field.selectionStart or field.selectionStart == '0')
      startPos = field.selectionStart-del
      endPos = field.selectionEnd
      scrollTop = field.scrollTop
      field.value = field.value.substring(0, startPos)+ value+ field.value.substring(endPos, field.value.length)
      field.focus()
      field.selectionStart = startPos + value.length
      field.selectionEnd = startPos + value.length
      field.scrollTop = scrollTop

    else
      field.value += value
      field.focus()

    updateMath()

  class Timer
    startTimer: (duration) ->
      @duration = duration
      @startTime = (new Date).getTime()
      clearTimeout(@timeout)
      @timeout = setTimeout((-> updateBox()),@duration)

    isOn: ->
      if @startTime
        return ((new Date).getTime() - @startTime < @duration)
      return false

  timer = new Timer()
  keys = []
  updateBox = ->
    if keys
        length = keys.length
        startIdx = 0
        if length>1
          char = keys[length-1]
          for i in [length-1...-1] by -1
            if keys[i] != char
              startIdx = i+1
              break

          power = length-startIdx
          if power>1
            insertAtCursor(inputBox,char+'^'+power.toString(),power)
         
    keys = []

  updateMath = ->
    # Get value without whitespace
    value = inputBox.value.replace(/^\s+/, '').replace(/\s+$/, '')
    if value
      # Remove parentheses after functions/operations
      for func in ['sqrt','^','lim','/']
        indexes = findAllIndexes(value, func)
        for i in indexes
          startPos = i+func.length
          if value[startPos] == '('
            endPos = findBracket(value,startPos)
            if endPos
              # Limit adjustment
              if func=='lim'
                value = changeBrackets(value,startPos,endPos,'↙')
              else
                value = changeBrackets(value,startPos,endPos)
      
      # Remove parentheses before division sign
      indexes = findAllIndexes(value,'/')
      for j in indexes
        if value[j-1]==')'
          endPos = j-1
          startPos = findBracket(value,endPos,opening=true)
          if endPos
            value = changeBrackets(value,startPos,endPos)
                    
      value = findAndReplace(value,funcregex)
      value = findAndReplace(value,lettersregex)
      value = findAndReplace(value,trigregex)
      value = findAndReplace(value,miscregex)
      
      # Escape string
      value = value.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

      # Resize to fit
      if value.length>50
        size = fontSize - 1.2

      else if value.length>35
        size = fontSize - 0.8

      else if value.length>20
        size = fontSize - 0.4

      else
        size = fontSize

      equationBox.style.fontSize = size.toString() + 'em'

      equationBox.innerHTML = '\$\$' + value + '\$\$'

      M.parseMath(equationBox)
    else
      equationBox.innerHTML = message
      equationBox.style.fontSize = fontSize.toString() + 'em'

  #Update Math Display on load
  updateMath()

  needBracket = ->
    startPos = inputBox.selectionStart
    for f in trigfunctions
      string = inputBox.value.substring(startPos-(f.length+1), startPos)
      if string == f+'h'
        return true

    for f in functions
      string = inputBox.value.substring(startPos-(f.length), startPos)
      if string == f
        return true
           
  # On key down event
  inputBox.onkeydown = (event) ->
    keyCode = event.keyCode
    key = String.fromCharCode(keyCode).toLowerCase()
    initialValue = inputBox.value[...-1]

    if (keyCode >= 65 and keyCode <= 90)
      timer.startTimer(300)
      keys.push key

    char = keyCodeMap[event.keyCode]
    
    if char of chars
      event.preventDefault()
      event.stopPropagation()

      # Close all brackets
      if event.shiftKey and keyCodeMap[event.keyCode] == ']'
        startPos = inputBox.selectionStart
        value = inputBox.value.substring(0, startPos)

        bracketsNo = 0
        for i in value
          if i == '('
            bracketsNo += 1
          if i == ')'
            bracketsNo -= 1

        if bracketsNo>0
          insertAtCursor(inputBox,')'.repeat(bracketsNo))
      
      else
        insertAtCursor(inputBox, chars[char])

  # On key up event
  inputBox.onkeyup = (event) ->
    keyCode = event.keyCode

    # Add bracket after functions
    if (keyCode >= 65 and keyCode <= 90)
      if needBracket()
        insertAtCursor(inputBox,'(')

    updateMath()
