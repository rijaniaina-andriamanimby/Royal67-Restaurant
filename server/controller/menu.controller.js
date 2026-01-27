const Menu = require('../model/menu.model')

exports.getMenu = async (req, res) => {
    try {
        const response = await Menu.getAll()
        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message: 'Une erreur est survenu lors de la récupération des données !', error})
    }
}

exports.insert = async (req, res) => {
    try {
        const {nom, categorie, prix} = req.body
        if(nom.trim('') && categorie.trim('') && !isNaN(prix)){
            const response = await Menu.insert(nom, categorie, prix);
            return res.status(201).json(response)
        }
        throw TypeError
    } catch (error) {
        return res.status(500).json({
            message: 'Une erreur du serveur est survenu lord de l\'insertion des données !',
            error
        })
    }
}

exports.update = async (req, res) => {
    try {
        const id = req.params.id
        const {nom, categorie, prix} = req.body
        if(nom.trim('') && !isNaN(prix)){
            const response = await Menu.update(id, nom, categorie, prix)
            return res.status(200).json(response)
        }
        throw TypeError
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Une erreur du serveur est survenu lord de la modification des données !',
            error
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id
        const response = await Menu.delete(id)
        if(response) return res.status(204).json({message: "Suppréssion efféctuer !"})
        return res.status(400).json({message: 'La suppréssion n\' a pas été efféctuer !'})
    } catch (error) {
        return res.status(500).json({
            message: 'Une erreur du serveur est survenu lord de la suppréssion des données !',
            error
        })
    }
}