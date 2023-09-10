const databaseController = require('./controllers/database-controller')

// 執行raw_stock_groups抓檔程式
// databaseController.rawStockGroups()

// 執行raw_stock_groups衍生到stock_groups程式
// databaseController.deriveToStockGroup()

// 執行raw_stock抓檔程式
// databaseController.rawStocks()

// 執行raw_stock衍生到stock程式
databaseController.deriveToStocks()
