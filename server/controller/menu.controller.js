const Menu = require('../model/menu.model')

exports.getMenu = async (req, res) => {
    try {
        const response = await Menu.getAll()
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message: 'Une erreur est survenu lors de la récupération des données !', error})
    }
}