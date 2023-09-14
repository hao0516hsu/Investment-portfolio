// 民國年轉西元年
const dateConverter = dateString => {
  const dateArray = dateString.split('/')
  return `${Number(dateArray[0]) + 1911}-${dateArray[1]}-${dateArray[2]}`
}
// convert currency string to number
const stringToNumber = string => {
  return Number(string.replace(/[^0-9.-]+/g, ''))
}
// 處理抓檔的報價null值
const priceConverter = price => {
  return (price === '--') ? null : stringToNumber(price)
}
// 處理漲跌價
const diffPrcConverter = diffPrc => {
  return (diffPrc.charAt(0) === '-') ? Number(diffPrc) : Number(diffPrc.slice(1))
}

module.exports = { dateConverter, stringToNumber, priceConverter, diffPrcConverter }
