export const joinPath = (dir, path) => {
  const p1 = /^(.*?)[^/]+\/?$/
  const p2 = /^\.\.\/(.*)$/
  let r1, r2
  do {
    r1 = p1.exec(dir)
    r2 = p2.exec(path)
    if (r1 && r2) {
      dir = r1[1]
      path = r2[1]
    } else {
      break
    }
  } while (true)
  return dir + path
}
