const pool = require('../db/db')
const { update } = require('./menu.model')

module.exports = {
    getAll : async () => {
        const response = await pool.query('SELECT * FROM categorie')
        return response.rows
    }, 
    add : async(nom)=> {
        const response = await pool.query('INSERT INTO categorie (nom) VALUES ($1) RETURNING *', [nom])
        return response.rows[0]
    },
    update: async(id, nom)=>{
        const response = await pool.query('UPDATE categorie SET nom=$2 WHERE id=$1 RETURNING *',[id,nom])
        return response.rows[0]
    },
    delete : async (id)=>{
        const response = await pool.query('DELETE FROM categorie WHERE id=$1',[id])
        return response.rowCount > 0
    }
}