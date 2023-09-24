const databaseController = require('../controllers/database-controller')

const TIMER = 10000

// 執行Raw_stock_groups抓檔程式和衍生到Stock_groups程式
databaseController.rawStockGroups()

// 執行Raw_stocks抓檔程式和衍生到Stocks程式
setTimeout(() => { databaseController.rawStocks() }, TIMER)
