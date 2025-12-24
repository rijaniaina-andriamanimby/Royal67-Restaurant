import { useEffect, useState } from "react"
import api from "../service/api"
import FeedBackService from "../service/FeedBackService"
import TableMenu from "../components/Menu/TableMenu"
import MenuCards from "../components/Menu/MenuCards"
import MenuToolbar from "../components/Menu/MenuToolbar"
import Pagination from "../components/Pagination"
import MenuModal from "../components/Menu/MenuModal"
import { Plus, UtensilsCrossed } from "lucide-react"

const ITEMS_PER_PAGE = 6

const Menu = () => {
  const [menuList, setMenuList] = useState([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    api.get("/menu").then((res) => setMenuList(res.data))
  }, [])

  /* 🔍 Recherche */
  const filtered = menuList.filter((item) => item.nom.toLowerCase().includes(search.toLowerCase()))

  /* 🔃 Tri */
  if (sort === "nom") filtered.sort((a, b) => a.nom.localeCompare(b.nom))
  if (sort === "categorie") filtered.sort((a, b) => a.categorie.localeCompare(b.categorie))
  if (sort === "prix_asc") filtered.sort((a, b) => a.prix - b.prix)
  if (sort === "prix_desc") filtered.sort((a, b) => b.prix - a.prix)

  /* 📄 Pagination */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  const handleDelete = async (id) => {
    const confirm = await FeedBackService.confirm()
    if (confirm) {
      try {
        await api.delete(`/menu/${id}`)
        setMenuList((prev) => prev.filter((i) => i.id !== id))
        FeedBackService.success()
      } catch (error) {
        FeedBackService.error()
      }
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <UtensilsCrossed size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Menus</h1>
          </div>
          <button
            onClick={() => {
              setSelectedMenu(null)
              setOpenModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Nouveau Menu
          </button>
        </div>

        {/* Toolbar */}
        <MenuToolbar search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

        {/* Desktop Table */}
        <div className="hidden md:block">
          <TableMenu
            menuList={paginated}
            setSelectedMenu={(m) => {
              setSelectedMenu(m)
              setOpenModal(true)
            }}
            handleDelete={handleDelete}
          />
        </div>

        {/* Mobile Cards */}
        <MenuCards
          menuList={paginated}
          setSelectedMenu={(m) => {
            setSelectedMenu(m)
            setOpenModal(true)
          }}
          handleDelete={handleDelete}
        />

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

        {/* Modal */}
        {openModal && <MenuModal menu={selectedMenu} setMenuList={setMenuList} onClose={() => setOpenModal(false)} />}
      </div>
    </div>
  )
}

export default Menu
