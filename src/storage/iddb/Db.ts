interface IStoreConfig {
  name: string,
  opts: any,
}

abstract class Db {
  connection

  constructor(name, storesConfig, version?) {
    this.open(name, storesConfig, version)
  }

  protected open(name, storesConfig, version?) {
    this.connection = new Promise((res, rej) => {
      const rq = window.indexedDB.open(name, version)
      rq.onupgradeneeded = (e) => {
        // @ts-ignore
        const db = e.target.result
        storesConfig.forEach(({name, opts}) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, opts)
          }
        })
      }
      rq.onerror = (e) => rej(e)
      rq.onsuccess = () => res(rq.result)
    })
  }

  add(storeName, data) {
    return new Promise(res => {
      this.connection.then(db => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
        const rq = store.add(data)
        rq.onsuccess = (e) => {
          res(e.target.result)
        }
      })
    })
  }

  // TODO 完善type
  get(storeName, key): any {
    return new Promise(res => {
      this.connection.then(db => {
        const store = db.transaction(storeName).objectStore(storeName)
        const rq = store.get(key)
        rq.onsuccess = (e) => {
          res(e.target.result)
        }
      })
    })
  }

  getAll(storeName): any {
    return new Promise(async (res) => {
      this.connection.then(db => {
        const store = db.transaction(storeName).objectStore(storeName)
        const rq = store.openCursor()
        const result: any = []
        rq.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor) {
            result.push([cursor.key, cursor.value])
            cursor.continue()
          } else {
            res(result)
          }
        }
      })
    })
  }

  delete(storeName, key) {
    return new Promise(async (res) => {
      this.connection.then(db => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
        const rq = store.delete(key)
        rq.onsuccess = (e) => {
          res(e.target.result)
        }
      })
    })
  }
}

export default Db
