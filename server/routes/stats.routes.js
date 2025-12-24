const router = require("express").Router()
const StatsController = require("../controller/stats.controller")

router.get("/", StatsController.getGlobalStats)
router.get("/period", StatsController.getPeriodStats)
router.get("/category", StatsController.getCategoryStats)
router.get("/payments", StatsController.getPaymentsHistory)

module.exports = router
