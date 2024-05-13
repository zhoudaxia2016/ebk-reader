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

  getAllBooks() {
    return this.getAll(STORE.bookInfo)
  }
}

export default new EbkDb()
