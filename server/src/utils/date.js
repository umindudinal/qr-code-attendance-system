export const toDateKey = (value = new Date()) => {
  return new Date(value).toISOString().slice(0, 10)
}

export const daysAgo = (count) => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - count)
  return date
}
