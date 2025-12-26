const router = require('express').Router()
const CommandeController = require('../controller/commande.controller')

router.get('/', CommandeController.getAll)
router.post('/', CommandeController.insert)
router.delete('/:id', CommandeController.delete)

module.exports = router