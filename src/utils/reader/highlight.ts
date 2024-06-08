function init() {
  // TODO: 引入d.ts
  // @ts-ignore
  const Parser = window.TreeSitter
  return Parser.init()
}

const parsers = {}
const supportLangs = ['json', 'javascript']
const queryMap = {
  javascript: ['javascript', 'ecma'],
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

function getScore(code, matches) {
  return matches.length / code.length
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
      adjusted += code.substring(lastEnd, start)
    }
    adjusted += `<span class="${name}">${text}</span>`
    lastEnd = end
  })

  if (lastEnd < code.length) {
    adjusted += code.substring(lastEnd)
  }

  return adjusted
}

export default async function(code, lang?) {
  if (cache[code]) {
    return cache[code]
  }
  if (!lang) {
    const adjusted = await new Promise(async (res) => {
      let adjusted
      let maxScore = 0
      let matchLang
      let n = 0
      for (let i = 0; i < supportLangs.length; i++) {
        const lang = supportLangs[i]
        const matches = await parse(code, lang)
        const score = getScore(code, matches)
        if (score > maxScore) {
          maxScore = score
          adjusted = adjust(code, matches)
          matchLang = lang
          n ++
        }
        if (n > 2) {
          res(adjusted)
          return
        }
      }
      res(adjusted)
    })
    if (adjusted) {
      cache[code] = adjusted
      return adjusted
    }
  }
  const matches = await parse(code, 'javascript')
  const adjusted = adjust(code, matches)
  cache[code] = adjusted
  return adjusted
}
