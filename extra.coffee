  adjustForBrackets = (value,func,before=false) ->
    exception = '[^\\'+func+']'
    if before
      regex = new RegExp('\\('+exception+'*\\)'+'\\'+func,"g")
    else
      regex = new RegExp('\\'+func+'\\('+exception+'*\\)',"g")
    console.log(regex)
    matches = value.match(regex)

    if matches
      console.log(matches)
      for m in matches
        if m.split(')').length-1 == m.split('(').length-1# and not value.match(/\)[^\(\)]*\(/)
          regex = new RegExp(m,"g")
          if before
            value = value.replace(m,'{'+m[1...-2]+'}'+func)
          else
            value = value.replace(m,func+'{'+m[2...-1]+'}')
    return value


      # Division adjustment
      #value = adjustForBrackets(value,'/',before=true)
      value = adjustForBrackets(value,'/')
      # Exponent adjustment
      value = adjustForBrackets(value,'^')
      # Squareroot adjustment
      value = adjustForBrackets(value,'√')

      # Wrap at operators
      #value = value.replace(/([\S\s]{30,31}[\+\-\*])/g , "$1\\html'&lt;br&gt;'")
