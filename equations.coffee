root = exports ? this

String::repeat = (num) ->
  return new Array(num + 1).join(this)

class Equation
  @chars: {'[':'(',']':')',"'":'*',';':'+','`':"'",'up':'^(','down':'_'}

  @keyCodeMap: {
    8:"backspace", 38:"up", 40:"down", 59:";", 186:";",
    192:'`', 219:"[", 221:"]", 222:"'"}

  @lettersregex: {
    'Alpha':'Α','alpha':'α','Beta':'Β','beta':'β','Gamma':'Γ','gamma':'γ',
    'Delta':'Δ','delta':'δ','Epsilon':'Ε','epsilon':'ε','Zeta':'Ζ','zeta':'ζ',
    'Eta':'Η','Theta':'Θ','theta':'θ','Iota':'Ι','iota':'ι',
    'Kappa':'Κ','kappa':'κ','Lambda':'Λ','lambda':'λ','Mu':'Μ','mu':'μ',
    'Nu':'Ν','nu':'ν','Xi':'Ξ','xi':'ξ','Omicron':'Ο','omicron':'ο',
    'Pi':'Π','pi':'π','Rho':'Ρ','rho':'ρ','Sigma':'∑','sigma':'σ',
    'Tau':'Τ','tau':'τ','Upsilon':'Υ','upsilon':'υ','Phi':'Φ','phi':'φ',
    'Chi':'Χ','chi':'χ','Psi':'Ψ','Omega':'Ω','omega':'ω',
    'inf':'∞'
  }
  @letters2regex: {'eta':'η','psi':'ψ','del':'∇'}

  @trigfunctions: ['sin','cos','tan']

  @funcregex: {
    'exp':'\exp','log':'\log','sqrt':'√','int':'∫','lim':'\lim','sum':'∑'}

  @miscregex: {
    '===':'≡','<-':'←','->':'→','<==':'⇐','==>':'⇒','<=':'≤',
    '>=':'≥','!=':'≠','!<':'≮','!>':'≯','\\+/-':'±','\\*':'×'}

  @deltavars: ['x','y','t']

  @filters: [
    '\\$', '\\{', '\\}',
    '\\\\bo', '\\\\it', '\\\\bi', '\\\\sc', '\\\\fr', '\\\\ov',
    '\\\\table', '\\\\text', '\\\\html'
  ]

  constructor: ->
    @inputBox = document.getElementById('inputBox')
    @equationBox = document.getElementById('equationBox')
    @fontSize = parseFloat(@equationBox.style.fontSize)
    @message = @equationBox.innerHTML

    @keys = []

    @functions = Equation.trigfunctions.concat(Object.keys(Equation.funcregex))

    @trigregex = {}

    for i in Equation.trigfunctions
      @trigregex['(arc)?'+i+'(h)?'] = '\\'+'$1'+i+'$2'

    #Initialize timeout. Used for exponent/power shortcut.
    timeout = setTimeout((->), 0)

    # On key down event
    @inputBox.onkeydown = (event) =>
      keyCode = event.keyCode
      key = String.fromCharCode(keyCode).toLowerCase()

      if (keyCode >= 65 and keyCode <= 90)
        clearTimeout(timeout)
        timeout = setTimeout((=> @updateBox()),300)
        @keys.push key

      char = Equation.keyCodeMap[event.keyCode]

      if char of Equation.chars
        event.preventDefault()
        event.stopPropagation()

        # Close all brackets
        if event.shiftKey and Equation.keyCodeMap[event.keyCode] == ']'
          startPos = @inputBox.selectionStart
          value = @inputBox.value[...startPos]

          bracketsNo = 0
          for i in value
            if i == '('
              bracketsNo += 1
            if i == ')'
              bracketsNo -= 1

          if bracketsNo > 0
            @insertAtCursor(@inputBox,')'.repeat(bracketsNo))

        else
          @insertAtCursor(@inputBox, Equation.chars[char])

      else
        # Update the equation box immediately instead of waiting for keyup
        setTimeout((=> @updateMath()), 0)

    # On key up event
    @inputBox.onkeyup = (event) =>
      keyCode = event.keyCode

      # Add bracket after functions
      if (keyCode >= 65 and keyCode <= 90)
        if @needBracket()
          @insertAtCursor(@inputBox,'(')

    @inputBox.onsearch = =>
      if not @inputBox.value
        @equationBox.innerHTML = @message

    #Update Math Display on load
    @updateMath()

  findAndReplace: (string,object) ->
    for i,j of object
      regex = new RegExp(i,"g")
      string = string.replace(regex,j)
    return string

  findAllIndexes: (source, find) ->
    result = []
    for i in [0...source.length-1]
      if source[i...i + find.length] == find
        result.push(i)

    return result

  findBracket: (string,startPos,opening=false) ->
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

      if count == 0
        return i

  parseMatrices: (string) ->
    s = string
    for c, idx in s by -1
      if s[idx...idx+2] == '(('
        bracketEnd = @findBracket(s, idx)
        innerBracketStart = @findBracket(s,bracketEnd-1,opening=true)
        if s[innerBracketStart-1] == ',' or innerBracketStart == idx + 1
          rows = []
          rowStart = idx + 1
          while true
            rowEnd = @findBracket(s, rowStart)
            rows.push(s[rowStart+1...rowEnd])
            if s[rowEnd+1] == ','
              rowStart = rowEnd+2
            else
              break
          table = "(\\table #{ rows.join(';') })"
          s = s[...idx] + table + s[bracketEnd+1...]
    return s

  changeBrackets: (string,startPos,endPos,prefix='',middle='') ->
    if not middle
      middle = string[startPos+1...endPos]
    string = string[...startPos]+prefix+'{'+middle+'}'+string[endPos+1...]
    return string

  insertAtCursor: (field,value,del = 0) ->
    # If IE
    if document.selection
      field.focus()
      sel = document.selection.createRange()
      if del
        sel.moveStart('character',-del)
      sel.text = value
      field.focus()

    else if (field.selectionStart or field.selectionStart == 0)
      startPos = field.selectionStart-del
      endPos = field.selectionEnd
      scrollTop = field.scrollTop

      field.value = "#{field.value[...startPos]}#{value}#{
        field.value[endPos...field.value.length]}"

      field.focus()
      field.selectionStart = startPos + value.length
      field.selectionEnd = startPos + value.length
      field.scrollTop = scrollTop

    else
      field.value += value
      field.focus()

    @updateMath()

  updateBox: ->
    if @keys
      length = @keys.length
      startIdx = 0
      if length > 1
        char = @keys[length-1]
        for i in [length-1...-1] by -1
          if @keys[i] != char
            startIdx = i+1
            break

        power = length-startIdx
        if power > 1
          @insertAtCursor(@inputBox,char+'^'+power.toString(),power)

    @keys = []

  updateMath: ->
    value = @inputBox.value

    for v in Equation.deltavars
      for d in ['d', 'delta']
        value = value.replace("/#{d}#{v}", "/(#{d}#{v})")

    for f in Equation.filters
      regex = new RegExp("\\\\*#{f}", 'g')
      value = value.replace(regex, "#{f}")

    # Remove whitespace and trailing backslashes
    value = value.replace(/\s/g, '').replace(/\\+$/, '')

    value = @parseMatrices(value)

    if value
      # Remove parentheses after functions/operations
      for func in ['sqrt','^','_','/','lim','int','sum']
        indexes = @findAllIndexes(value, func)
        for i in indexes.reverse()
          startPos = i+func.length
          if value[startPos] == '('
            endPos = @findBracket(value,startPos)
            if endPos
              # Limit underscript adjustment
              if func == 'lim'
                value = @changeBrackets(value,startPos,endPos,'↙')

              # Functions with overscript and underscript
              else if func == 'int' or func == 'sum'
                args = value[startPos+1...endPos]
                argsList = args.split(',')

                if argsList.length == 2
                  [under,over] =  argsList
                  value = @changeBrackets(value,startPos,endPos,
                                         '↙',under+'}↖{'+over)

              else
                value = @changeBrackets(value,startPos,endPos)

      # Remove parentheses before division sign
      indexes = @findAllIndexes(value,'/')
      for j in indexes
        if value[j-1] == ')'
          endPos = j-1
          startPos = @findBracket(value,endPos,opening=true)
          if startPos?
            value = @changeBrackets(value,startPos,endPos)

      value = @findAndReplace(value,Equation.funcregex)
      value = @findAndReplace(value,Equation.lettersregex)
      value = @findAndReplace(value,Equation.letters2regex)
      value = @findAndReplace(value,@trigregex)
      value = @findAndReplace(value,Equation.miscregex)

      # Escape string
      value = value.replace(/&/g, '&amp;')
                   .replace(/>/g, '&gt;')
                   .replace(/</g, '&lt;')
                   .replace(/"/g, '&quot;')

      # Resize to fit
      if value.length > 160
        size = @fontSize - 1.2

      else if value.length > 80
        size = @fontSize - 0.8

      else if value.length > 40
        size = @fontSize - 0.4

      else
        size = @fontSize

      @equationBox.style.fontSize = size.toString() + 'em'

      @equationBox.innerHTML = '\$\$' + value + '\$\$'
      M.parseMath(@equationBox)

    else
      @equationBox.innerHTML = @message
      @equationBox.style.fontSize = @fontSize.toString() + 'em'


  needBracket: ->
    startPos = @inputBox.selectionStart
    for f in Equation.trigfunctions
      string = @inputBox.value[startPos-(f.length+1)...startPos]
      if string == f+'h'
        return true

    for f in @functions
      string = @inputBox.value[startPos-(f.length)...startPos]
      if string == f
        return true

root.Equation = Equation
