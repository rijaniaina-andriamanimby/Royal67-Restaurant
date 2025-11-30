const router = require('express').Router()
const MenuController = require('../controller/menu.controller')

router.get('/', MenuController.getMenu)
router.post('/', MenuController.insert)
router.put('/:id', MenuController.update)
router.delete('/:id', MenuController.delete)

module.exports = router