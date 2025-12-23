import React from 'react'
import { BiEdit, BiTrash, BiMoney, BiCategory, BiFoodMenu } from 'react-icons/bi'

const TableMenu = ({ menuList, setSelectedMenu, handleDelete }) => {
    const tdStyle = "py-2 text-gray-500"
    const divStyle = "flex items-center justify-center gap-2"
    const trStyle = "my-2"
    return (
        <div className='flex justify-center '>
            <table className='w-1/2 shadow-2xl rounded-lg'>
                <thead className='p-5'>
                    <tr className={trStyle}>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        menuList.map((item) => (
                            <tr key={item.id} className={trStyle}>
                                <td className={tdStyle}>
                                    <div className={divStyle}>
                                        <BiFoodMenu size={18}/>
                                        {item.nom}
                                    </div>
                                </td>
                                <td className={tdStyle}>
                                    <div className={divStyle}>
                                        <BiCategory size={18}/>
                                        {item.categorie}
                                    </div>
                                </td>
                                <td className={tdStyle}>
                                    <div className={divStyle}>
                                        <BiMoney size={18}/>
                                        {item.prix}
                                    </div>
                                </td>
                                <td className='flex items-center justify-center gap-1 text-gray-500'>
                                    <button onClick={() => setSelectedMenu(item)} className='flex items-center justify-center gap-2 text-emerald-500 hover:text-emerald-700 p-2 cursor-pointer rounded-sm'>
                                        <BiEdit size={18} />
                                        <span>Modifier</span>
                                    </button>
                                    <button onClick={() => handleDelete(item.id)}
                                        className='flex items-center justify-center gap-2 text-red-500 hover:text-red-700 p-2 cursor-pointer rounded-sm'>
                                        <BiTrash size={18} />
                                        <span>Supprimer</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {/** PAGINATION AFFICHER 13 PAR PAGES */}
        </div>
    )
}

export default TableMenu
