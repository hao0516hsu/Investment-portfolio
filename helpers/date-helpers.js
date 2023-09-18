// getDay: 取得日期
const getDay = date => {
  return String(date.getDate()).padStart(2, '0')
}
// getMonth: 取得月份
const getMonth = date => {
  return String(date.getMonth() + 1).padStart(2, '0')
}
// getYear: 取得年份
const getYear = date => {
  return date.getFullYear()
}
// newDate: 取得格式為[YYYY-MM-DD]的日期
const newDate = date => {
  return `${getYear(date)}-${getMonth(date)}-${getDay(date)}`
}
// newDate: 取得格式為[YYYY-MM-DD]的日期
const dateAPI = date => {
  return `${getYear(date)}${getMonth(date)}${getDay(date)}`
}

module.exports = { newDate, dateAPI }
