const router = require('express').Router()
const MenuController = require('../controller/menu.controller')
router.get('/', MenuController.getMenu)

module.exports = router