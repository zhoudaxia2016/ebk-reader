import {toArrayBuffer} from '~/utils/fileReader'
import {getBook} from '~/utils/reader'
import CryptoJS from 'crypto-js'
import iddb from '~/storage/iddb'

function getMd5(data) {
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

export const saveBooks = async (files, md5Set, isBuffer?) => {
  isBuffer = isBuffer === undefined ? false : isBuffer
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
    const cover = await book.getCover()
    const createTime = Date.now()
    const id = await iddb.addBook(data, {createTime, cover, name: file.name, type: file.type, md5, ...book.metadata})
    return {name: file.name, id, isSuccess: true}
  }))
  const successFiles = result.filter(_ => _.isSuccess)
  const failFiles = result.filter(_ => !_.isSuccess)
  return {successFiles, failFiles}
}
