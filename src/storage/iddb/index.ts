import Db from './Db'

enum STORE {
  bookData = 'bookData',
  bookInfo = 'bookInfo',
  note = 'note',
}

const version = 2

class EbkDb extends Db {
  constructor() {
    super('ebk-reader', [
      {name: STORE.bookData, opts: {autoIncrement: true}},
      {name: STORE.bookInfo, opts: {keyPath: 'id'}},
      {name: STORE.note, opts: {keyPath: 'id'}},
    ], version)
  }

  async addBook(data, info) {
    const id = await this.add(STORE.bookData, data)
    info = {...info, id}
    return this.add(STORE.bookInfo, info)
  }

  getBookInfo(id) {
    return this.get(STORE.bookInfo, id)
  }

  getBookData(id) {
    return this.get(STORE.bookData, id)
  }

  getAllBookInfo() {
    return this.getAll(STORE.bookInfo)
  }

  getAllBookData() {
    return this.getAll(STORE.bookData)
  }

  deleteBook(id) {
    this.delete(STORE.bookData, id)
    this.delete(STORE.bookInfo, id)
  }

  getNotes() {
    return this.getAll(STORE.note)
  }

  addNote(value) {
    return this.add(STORE.note, value)
  }

  deleteNote(id) {
    return this.delete(STORE.note, id)
  }

  updateNote(value) {
    return this.update(STORE.note, value)
  }
}

export default new EbkDb()
