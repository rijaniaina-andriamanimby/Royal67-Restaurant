import React, { useState } from 'react'
import api from '../../service/api'

const MenuForm = ({ menu, setMenuList, onClose }) => {
  const [nom, setNom] = useState(menu?.nom || '')
  const [categorie, setCategorie] = useState(menu?.categorie || '')
  const [prix, setPrix] = useState(menu?.prix || '')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (menu) {
      const res = await api.put(`/menu/${menu.id}`, { nom, categorie, prix })
      setMenuList(prev =>
        prev.map(item => item.id === menu.id ? res.data : item)
      )
    } else {
      const res = await api.post('/menu', { nom, categorie, prix })
      setMenuList(prev => [...prev, res.data])
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {menu ? 'Modifier le menu' : 'Ajouter un menu'}
      </h2>

      <div>
        <label className="text-sm text-gray-600">Nom</label>
        <input
          className="w-full border rounded-lg p-2 focus:ring focus:ring-emerald-300"
          value={nom}
          onChange={e => setNom(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Catégorie</label>
        <input
          list="categories"
          className="w-full border rounded-lg p-2"
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
        />
        <datalist id="categories">
          <option value="Boisson" />
          <option value="Plat" />
          <option value="Dessert" />
        </datalist>
      </div>

      <div>
        <label className="text-sm text-gray-600">Prix (Ar)</label>
        <input
          type="number"
          className="w-full border rounded-lg p-2"
          value={prix}
          onChange={e => setPrix(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          {menu ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export default MenuForm
