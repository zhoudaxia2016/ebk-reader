import Db from './'

class BookDataSt extends Db {
  constructor() {
    super('bookData', {autoIncrement: true})
  }
}

export default new BookDataSt()
