const Categorie = require('../model/categorie.model')

exports.getAll = async (req, res) => {
    try {
        const response = await Categorie.getAll()
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
}

exports.add = async (req, res) => {
    try {
        const { nom } = req.body;
        const response = await Categorie.add(nom)
        return res.status(201).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
}

exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const response = await Categorie.delete(id)
        return res.json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
}

exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const {nom} = req.body;
        const response = await Categorie.update(id,nom)
        return res.json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
}