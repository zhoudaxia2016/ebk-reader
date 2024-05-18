import Db from './Db'

enum STORE {
  bookData = 'bookData',
  bookInfo = 'bookInfo',
}

class EbkDb extends Db {
  constructor() {
    super('ebk-reader', [
      {name: STORE.bookData, opts: {autoIncrement: true}},
      {name: STORE.bookInfo, opts: {keyPath: 'id'}},
    ])
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
}

export default new EbkDb()
