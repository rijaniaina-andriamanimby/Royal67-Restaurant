import React, { useEffect, useState } from 'react'
import api from '../service/api'
import FeedBackService from '../service/FeedBackService'
import TableMenu from '../components/Menu/TableMenu'
import MenuCards from '../components/Menu/MenuCards'
import MenuToolbar from '../components/Menu/MenuToolbar'
import Pagination from '../components/Pagination'
import MenuModal from '../components/Menu/MenuModal'
import { BiPlus, BiPlusCircle } from 'react-icons/bi'

const ITEMS_PER_PAGE = 9

const Menu = () => {
  const [menuList, setMenuList] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    api.get('/menu').then(res => setMenuList(res.data))
  }, [])

  /* 🔍 Recherche */
  let filtered = menuList.filter(item =>
    item.nom.toLowerCase().includes(search.toLowerCase())
  )

  /* 🔃 Tri */
  if (sort === 'nom') filtered.sort((a, b) => a.nom.localeCompare(b.nom))
  if (sort === 'categorie') filtered.sort((a, b) => a.categorie.localeCompare(b.categorie))
  if (sort === 'prix_asc') filtered.sort((a, b) => a.prix - b.prix)
  if (sort === 'prix_desc') filtered.sort((a, b) => b.prix - a.prix)

  /* 📄 Pagination */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  const handleDelete = async (id) => {
    const confirm = await FeedBackService.confirm()
    if (confirm) {
      try {
        await api.delete(`/menu/${id}`)
        setMenuList(prev => prev.filter(i => i.id !== id))
        FeedBackService.success()
      } catch (error) {
        FeedBackService.error()
      }
    }
  }

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Menus</h1>
        <button
          onClick={() => { setSelectedMenu(null); setOpenModal(true) }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center"
        >
          <BiPlusCircle /> Nouvelle menu
        </button>
      </div>

      <MenuToolbar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      {/* Desktop */}
      <div className="hidden md:block">
        <TableMenu
          menuList={paginated}
          setSelectedMenu={(m) => { setSelectedMenu(m); setOpenModal(true) }}
          handleDelete={handleDelete}
        />
      </div>

      {/* Mobile */}
      <MenuCards
        menuList={paginated}
        setSelectedMenu={(m) => { setSelectedMenu(m); setOpenModal(true) }}
        handleDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {openModal && (
        <MenuModal
          menu={selectedMenu}
          setMenuList={setMenuList}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  )
}

export default Menu
