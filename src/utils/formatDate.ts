export default function(time) {
  const date = new Date(time)
  return `${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日`
}
