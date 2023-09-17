const databaseController = require('./controllers/database-controller')

// 執行Raw_stock_groups抓檔程式和衍生到Stock_groups程式
// databaseController.rawStockGroups()

// 執行Raw_stocks抓檔程式和衍生到Stocks程式
// databaseController.rawStocks()

// 執行Raw_prices抓檔程式
// databaseController.rawStockPrices()

// 執行Raw_prices衍生到Prices程式
databaseController.deriveToAvgprices()
