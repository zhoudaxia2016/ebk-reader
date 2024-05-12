import Db from './'

class BookInfoSt extends Db {
  constructor() {
    super('bookInfo', {keyPath: 'id'})
  }
}

export default new BookInfoSt()
