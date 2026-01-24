import { useEffect, useState } from "react"
import api from "../service/api"
import { groupCommande } from "../utils/groupCommande"
import CommandeToolbar from "../components/Commande/CommandeToolbar"
import TableCommande from "../components/Commande/TableCommande"
import CommandeCards from "../components/Commande/CommandeCards"
import Pagination from "../components/Pagination"
import CommandeModal from "../components/Commande/CommandeModal"
import { Plus, PlusCircle, ShoppingCart } from "lucide-react"
import FeedBackService from '../service/FeedBackService'

const ITEMS_PER_PAGE = 5

const Commande = () => {
  const [commandes, setCommandes] = useState([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCommande, setSelectedCommande] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [categorieList, setCategorieList] = useState([])

  useEffect(() => {
    api.get("/commande").then((res) => {
      setCommandes(groupCommande(res.data))
    })
    api.get("/categorie").then((res)=>{
      setCategorieList(res.data)
    })
  }, [])

  const filtered = commandes.filter((c) => c.nomTable.toLowerCase().includes(search.toLowerCase()))

  if (sort === "date_desc") filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  if (sort === "date_asc") filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  if (sort === "total_desc")
    filtered.sort((a, b) => {
      const totalA = a.details.reduce((s, d) => s + d.prix * d.quantite, 0)
      const totalB = b.details.reduce((s, d) => s + d.prix * d.quantite, 0)
      return totalB - totalA
    })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  const handleDelete = async (id) => {
    const result = await FeedBackService.confirm()
    if (result) {
      try {
        await api.delete('/commande/' + id)
        FeedBackService.success()
        api.get("/commande").then((res) => {
          setCommandes(groupCommande(res.data))
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <ShoppingCart size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Commandes</h1>
          </div>
          <button
            onClick={() => {
              setSelectedCommande(null)
              setOpenModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <PlusCircle size={20} />
            Nouvelle Commande
          </button>
        </div>

        {/* Toolbar */}
        <CommandeToolbar search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

        {/* Desktop Table */}
        <div className="hidden md:block">
          <TableCommande commandes={paginated} handleDelete={handleDelete} />
        </div>

        {/* Mobile Cards */}
        <CommandeCards commandes={paginated} />

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

        {/* Modal */}
        {openModal && (
          <CommandeModal onClose={() => setOpenModal(false)} setCommandes={setCommandes} categorieList={categorieList} />
        )}
      </div>
    </div>
  )
}

export default Commande
