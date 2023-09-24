const databaseController = require('../controllers/database-controller')
const DATA_DATE = '2023/8/31'

// 執行Prices衍生到Average_Prices程式
databaseController.deriveToAvgprices(DATA_DATE)
