export const debounce = function (func, wait = 200) {
  let timeId, context

  function clearTime() {
    if (timeId) {
      clearTimeout(timeId);
      timeId = null
    }
  }

  return function (...args) {
    const context = this
    clearTime()
    timeId = setTimeout(() => {
      clearTime()
      func.apply(context, args)
    }, wait)
  }
}

