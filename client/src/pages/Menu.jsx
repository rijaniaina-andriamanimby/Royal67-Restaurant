import React, { useEffect, useState } from 'react'
import api from '../service/api'
import FeedBackService from '../service/FeedBackService'
import MenuForm from '../components/MenuForm'
import TableMenu from '../components/TableMenu'
import { BiPlusCircle } from 'react-icons/bi'

const Menu = () => {
  const [menuList, setMenuList] = useState([])
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  const getMenu = async () => {
    const response = await api.get('/menu')
    setMenuList(response.data)
  }

  const handleDelete = async (id) => {
    const result = await FeedBackService.confirm();
    if (result) {
      try {
        await api.delete('/menu/' + id)
        setMenuList(menuList.filter((value) => {
          if (value.id != id) return true
        }))
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    getMenu()
  }, [])

  return (
    <div>
      <div>
        <button onClick={() => setOpenModal(true)}
          className='bg-emerald-500 p-3 cursor-pointer flex items-center justify-center gap-2 text-white inset-4 border-2 rounded-full hover:bg-emerald-700'>
          <BiPlusCircle size={18}/> 
          <span>Ajouter</span>
        </button>
      </div>
      <div>
        <div>
          Trier par : categorie / prix
        </div>
      </div>
      <TableMenu
        handleDelete={handleDelete}
        menuList={menuList}
        setSelectedMenu={setSelectedMenu}
      />
      {
        openModal || selectedMenu && (
          <MenuForm setMenuList={setMenuList} list={menuList} menu={selectedMenu} />
        )
      }
    </div>
  )
}

export default Menu
