import {toArrayBuffer} from '~/utils/fileReader'
import {getBook} from '~/utils/reader'
import CryptoJS from 'crypto-js'
import iddb from '~/storage/iddb'

export function getMd5(data) {
  const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data))
  return hash.toString(CryptoJS.enc.Hex)
}

export function parseFileName(name) {
  const match = /(.*)\.(\w+)$/.exec(name)
  if (match) {
    return {name: match[1], ext: match[2]}
  }
  return {}
}

export const saveBooks = async ({files, md5Set, isBuffer, onProgress}: {files: any[], md5Set: Set<string>, isBuffer?, onProgress?: (n: number) => void}) => {
  isBuffer = isBuffer === undefined ? false : isBuffer
  const total = files.length
  let finishCount = 0
  md5Set = new Set(md5Set)
  const result = await Promise.all(files.map(async file => {
    let data
    if (isBuffer) {
      data = file.data
      const {ext = ''} = parseFileName(file.name)
      file = new File([file.data], file.name, {type: `application/${ext}`})
    } else {
      data = await toArrayBuffer(file)
    }
    const book: any = await getBook(file)
    const md5 = getMd5(data)
    if (md5Set.has(md5)) {
      return {name: file.name, isSuccess: false}
    }
    md5Set.add(md5)
    const cover = await book.getCover()
    const createTime = Date.now()
    const id = await iddb.addBook(data, {createTime, cover, name: file.name, type: file.type, md5, ...book.metadata})
    finishCount++
    onProgress?.(100 * finishCount / total)
    return {name: file.name, id, isSuccess: true, md5}
  }))
  const successFiles = result.filter(_ => _.isSuccess)
  const failFiles = result.filter(_ => !_.isSuccess)
  return {successFiles, failFiles}
}
