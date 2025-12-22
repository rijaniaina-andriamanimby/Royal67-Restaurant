import React, { useEffect } from 'react'
import api from '../service/api'

const Commande = () => {
  const getCommande = async () => {
    const response = await api.get('/commande')
    console.log(response.data)
  }

  useEffect(() => {
    getCommande()
  }, [])

  return (
    <div>
    </div>
  )
}

export default Commande
