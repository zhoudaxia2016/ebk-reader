function init() {
  // TODO: 引入d.ts
  // @ts-ignore
  const Parser = window.TreeSitter
  return Parser.init()
}

const parsers = {}
const supportLangs = ['javascript', 'typescript', 'json', 'c', 'cpp', 'css', 'go', 'haskell', 'python', 'rust', 'tsx']
const queryMap = {
  javascript: ['javascript', 'ecma'],
  tsx: ['tsx', 'javascript', 'typescript', 'ecma']
}

async function parse(code, lang) {
  await init()
  if (!parsers[lang]) {
    // TODO: 引入d.ts
    // @ts-ignore
    const Parser = window.TreeSitter
    const wasm = await import(`./ts-modules/tree-sitter-${lang}.wasm`)
    const parser = new Parser()
    const jsonLang = await Parser.Language.load(wasm.default)
    parser.setLanguage(jsonLang)
    parsers[lang] = parser
  }
  const parser = parsers[lang]
  const tree = parser.parse(code)
  const queryFile = queryMap[lang] ? queryMap[lang] : [lang]
  const query = await Promise.all(queryFile.map(f => import(`./ts-querys/${f}.scm`)))
  const q = parser.language.query(query.map(_ => _.default).join('\n'))
  return q.matches(tree.rootNode)
}

const nodeTypeScoreMap = {
  variable: 0.4,
  ['type.builtin']: 1.5,
  ['punctuation.bracket']: 0.2,
  ['punctuation.delimiter']: 0.2,
}

function getScore(code, matches) {
  let score = 0
  let lastEnd = -1
  matches.forEach(match => {
    const start = match.captures[0].node.startIndex
    const end = match.captures[0].node.endIndex
    const name = match.captures[0].name
    const properties = match.setProperties
    if (start <= lastEnd) {
      lastEnd = end
      score -= 0.1
      return
    }
    if (properties?.score) {
      score += Number(properties.score)
    } else {
      score += nodeTypeScoreMap[name] || 1
    }
    lastEnd = end
  })
  return score / code.length
}

const replaceReg = /([&<>"'])/g
const replaceMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
}
function encodeHTML(source: string) {
    return source === null ? '' : (source + '').replace(replaceReg, function (str, c) {
        return replaceMap[c]
    })
}

const cache = {}

function adjust(code, matches) {
  let adjusted = ''
  let lastEnd = 0
  matches.forEach((match) => {
    const name = match.captures[0].name
    const text = match.captures[0].node.text
    const start = match.captures[0].node.startIndex
    const end = match.captures[0].node.endIndex

    if (start < lastEnd) {
      return // avoid duplicate matches for the same text
    }
    if (start > lastEnd) {
      adjusted += encodeHTML(code.substring(lastEnd, start))
    }
    adjusted += `<span class="${name}">${encodeHTML(text)}</span>`
    lastEnd = end
  })

  if (lastEnd < code.length) {
    adjusted += code.substring(lastEnd)
  }

  return adjusted
}

const defaultLang = 'javascript'
const langPattern = [
  {name: 'python', pattern: /^>>>/},
  {name: 'css', pattern: /^\s*[a-z]+(-[a-z]+)?: ?[^\n;]+;$/m},
]

export default async function(code, lang?) {
  if (cache[code]) {
    return cache[code]
  }
  if (!lang) {
    const guessLang = langPattern.find(_ => _.pattern.test(code))
    let langs = supportLangs
    if (guessLang) {
      langs = [guessLang.name]
    }
    const result = await new Promise(async (res) => {
      let adjusted
      let maxScore = 0
      let matchLang
      let n = 0
      for (let i = 0; i < langs.length; i++) {
        const lang = langs[i]
        const matches = await parse(code, lang)
        const score = getScore(code, matches)
        if (score > maxScore) {
          maxScore = score
          adjusted = adjust(code, matches)
          matchLang = lang
          n ++
        }
        if (n > 2) {
          res([matchLang, adjusted])
          return
        }
      }
      res([matchLang, adjusted])
    })
    if (result[0]) {
      cache[code] = result
      return result
    }
  }
  const matches = await parse(code, defaultLang)
  const adjusted = adjust(code, matches)
  cache[code] = adjusted
  return [defaultLang, adjusted]
}
