const prefix = 'ebk_'

export default class Storage {
  private id?: number
  private prefix: string
  constructor(name: string, id?: number) {
    this.id = id
    this.prefix = prefix + name
  }

  public get(key) {
    const json = localStorage.getItem(this.prefix)
    const allData = json ? JSON.parse(json) : {}
    if (!this.id) {
      return allData[key]
    }
    const data = allData[this.id] || {}
    return data[key]
  }

  public set(key, value) {
    const json = localStorage.getItem(this.prefix)
    const allData = json ? JSON.parse(json) : {}
    if (this.id) {
      const data = allData[this.id] || {}
      data[key] = value
      allData[this.id] = data
    } else {
      allData[key] = value
    }
    localStorage.setItem(this.prefix, JSON.stringify(allData))
  }

  public getAll() {
    const json = localStorage.getItem(this.prefix)
    const allData = json ? JSON.parse(json) : {}
    return allData
  }
}

