import React from 'react'
import { BiEdit, BiTrash } from 'react-icons/bi'

const TableMenu = ({ menuList, setSelectedMenu, handleDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-left">Nom</th>
            <th className="p-3">Catégorie</th>
            <th className="p-3">Prix</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {menuList.map(item => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{item.nom}</td>
              <td className="p-3 text-center">{item.categorie}</td>
              <td className="p-3 text-center">{item.prix} Ar</td>
              <td className="p-3 flex justify-center gap-3">
                <button
                  onClick={() => setSelectedMenu(item)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <BiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <BiTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableMenu
