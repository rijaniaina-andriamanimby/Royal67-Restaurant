import React, { useEffect, useState } from 'react'
import api from '../service/api'
import { groupCommande } from '../utils/groupCommande'
import CommandeToolbar from '../components/Commande/CommandeToolbar'
import TableCommande from '../components/Commande/TableCommande'
import CommandeCards from '../components/Commande/CommandeCards'
import Pagination from '../components/Pagination'
import CommandeModal from '../components/Commande/CommandeModal'
import { BiPlus, BiPlusCircle } from 'react-icons/bi'

const ITEMS_PER_PAGE = 5

const Commande = () => {
  const [commandes, setCommandes] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    api.get('/commande').then(res => {
      setCommandes(groupCommande(res.data))
    })
  }, [])

  /* 🔍 Recherche */
  let filtered = commandes.filter(c =>
    c.nomTable.toLowerCase().includes(search.toLowerCase())
  )

  /* 🔃 Tri */
  if (sort === 'date_desc') filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  if (sort === 'date_asc') filtered.sort((a, b) => new Date(a.date) - new Date(b.date))

  /* 📄 Pagination */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (page - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  const total = (cmd) =>
    cmd.details.reduce((s, d) => s + d.prix * d.quantite, 0)

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Commandes</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center justify-center"
        >
          <BiPlusCircle /> Nouvelle commande
        </button>
      </div>

      <CommandeToolbar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      {/* Desktop */}
      <div className="hidden md:block">
        <TableCommande commandes={paginated} />
      </div>

      {/* Mobile */}
      <CommandeCards commandes={paginated} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        setCurrentPage={setPage}
      />

      {openModal && (
        <CommandeModal
          onClose={() => setOpenModal(false)}
          setCommandes={setCommandes}
        />
      )}
    </div>
  )
}

export default Commande
