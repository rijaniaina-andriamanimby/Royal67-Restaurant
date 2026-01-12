const router = require('express').Router()
const categorieController = require('../controller/categorie.controller')

router.get('/', categorieController.getAll)
router.post('/', categorieController.add)
router.put('/:id', categorieController.update)
router.delete('/:id', categorieController.delete)

module.exports = router