const version = 1
const dbName = 'books'

const openDb = (cb?): Promise<any> => {
  return new Promise((res, rej) => {
    const request = indexedDB.open(dbName, version)
    request.onsuccess = (e: any) => {
      res(e.target.result)
    }
    request.onupgradeneeded = function (e: any) {
      cb?.(e)
    }
  })
}

export default class {
  name: string

  constructor(name, opts) {
    this.name = name
    openDb((e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, opts)
      }
    })
  }

  add(data) {
    return new Promise(async (res) => {
      const db = await openDb()
      const store = db.transaction(this.name, 'readwrite').objectStore(this.name)
      const rq = store.add(data)
      rq.onsuccess = (e) => {
        res(e.target.result)
      }
    })
  }

  // TODO 完善type
  get(id): any {
    return new Promise(async (res) => {
      const db = await openDb()
      const store = db.transaction(this.name).objectStore(this.name)
      const rq = store.get(id)
      rq.onsuccess = (e) => {
        res(e.target.result)
      }
    })
  }

  getAll(): any {
    return new Promise(async (res) => {
      const db = await openDb()
      const store = db.transaction(this.name, 'readwrite').objectStore(this.name)
      const rq = store.openCursor()
      const result: any = []
      rq.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          result.push(cursor.value)
          cursor.continue()
        } else {
          res(result)
        }
      }
    })
  }
}
