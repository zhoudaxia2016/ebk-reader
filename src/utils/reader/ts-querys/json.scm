[
  (true)
  (false)
] @boolean

(null) @constant.builtin

(number) @number

(pair
  key: (string) @property)

(pair
  value: (string) @string)

(array
  (string) @string)

([
  ","
  ":"
] @punctuation.delimiter (#set! "score" 1))

([
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket (#set! "score" 1))

(escape_sequence) @string.escape
