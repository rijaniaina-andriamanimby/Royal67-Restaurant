const Commande = require('../model/commande.model')
const CommandeDetail = require('../model/commandeDetail.model')
const Paiement = require('../model/paiement.model')

exports.getAll = async (req, res) => {
    try {
        const result = await Commande.getAll()
        // const response = result.map()
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: "Une erreur est survenue lors de la récupération des données !", error})
    }
}

exports.insert = async (req, res) => {
    try {
        const {nomTable, commandeDetail, payer, rendu, typePaiement} = req.body
        const commande = await Commande.insert(nomTable)
        commandeDetail.map(async (value)=>{
            await CommandeDetail.insert(commande.id, value.idMenu, value.quantite)
        })
        await Paiement.insert(payer, rendu, typePaiement, commande.id)
        return res.status(201).json({idCommande: commande.id})
    } catch (error) {
        return res.status(500).json({message: 'Une erreur est survenue lors de l\' insertion des données !', error})
    }
}

exports.delete = async (req, res) => {
    try {
        const id = req.params.id
        const result = await Commande.delete(id)
        if(result) return res.status(204).json({messaage: "L'élément à été supprimer avec succées !"})
    } catch (error) {
        return res.status(500).json({message: 'Une erreur est survenue lors de la suppréssion des données!', error})
    }
}