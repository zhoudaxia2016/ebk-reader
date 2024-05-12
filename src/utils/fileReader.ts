export function toArrayBuffer(file) {
  return new Promise((res) => {
    var fileReader = new FileReader()
    fileReader.onload = function(event: any) {
      res(event.target.result)
    };
    fileReader.readAsArrayBuffer(file)
  })
}

export function toDataURL(file) {
  return new Promise((res) => {
    var fileReader = new FileReader()
    fileReader.onload = function(event: any) {
      res(event.target.result)
    };
    fileReader.readAsDataURL(file)
  })
}

