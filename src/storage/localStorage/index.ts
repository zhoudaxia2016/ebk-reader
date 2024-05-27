const prefix = 'ebk_'

class Storage {
  protected prefix: string
  constructor(name: string) {
    this.prefix = prefix + name
  }
  protected getItem(defaultVal = {}) {
    const json = localStorage.getItem(this.prefix)
    return json ? JSON.parse(json) : defaultVal
  }
  protected setItem(val) {
    localStorage.setItem(this.prefix, JSON.stringify(val))
  }
  protected getAll(defaultVal = {}) {
    return this.getItem(defaultVal)
  }
}

export class ArrayStorage extends Storage {
  constructor({name}) {
    super(name)
  }

  public get(key) {
    const allData = this.getItem([])
    return allData.find(_ => _.id === key)
  }

  public set(key, val) {
    const allData = this.getItem([])
    const i =  allData.findIndex(_ => _.id === key)
    if (i === -1) {
      allData.push(val)
    } else {
      allData[i] = val
    }
    this.setItem(allData)
  }

  public getAll() {
    return super.getAll([])
  }

  public delete(key) {
    const allData = this.getItem([])
    const i =  allData.findIndex(_ => _.id === key)
    if (i !== -1) {
      allData.splice(i, 1)
    }
    this.setItem(allData)
  }
}

export class ObjectStorage extends Storage {
  private id?: number
  constructor({name, id}: {name: string, id?: number} ) {
    super(name)
    this.id = id
  }

  public get(key) {
    const allData = this.getItem()
    if (!this.id) {
      return allData[key]
    }
    const data = allData[this.id] || {}
    return data[key]
  }

  public set(key, value) {
    const allData = this.getItem()
    if (this.id) {
      const data = allData[this.id] || {}
      data[key] = value
      allData[this.id] = data
    } else {
      allData[key] = {...allData[key], ...value}
    }
    this.setItem(allData)
  }

  public getAll() {
    return super.getAll()
  }
}

const shelfStorage = new ArrayStorage({name: 'shelf'})
const bookUserInfoStorage = new ObjectStorage({name: 'book-userinfo'})

export {
  shelfStorage,
  bookUserInfoStorage,
}
