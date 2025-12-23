import React from 'react'
import { BiEdit, BiTrash } from 'react-icons/bi'

const MenuCards = ({ menuList, setSelectedMenu, handleDelete }) => {
  return (
    <div className="grid gap-4 md:hidden">
      {menuList.map(item => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow p-4 space-y-2"
        >
          <h3 className="font-semibold text-lg">{item.nom}</h3>
          <p className="text-sm text-gray-500">{item.categorie}</p>
          <p className="font-bold text-emerald-600">{item.prix} Ar</p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setSelectedMenu(item)}
              className="text-emerald-600"
            >
              <BiEdit size={18} />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-500"
            >
              <BiTrash size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MenuCards
