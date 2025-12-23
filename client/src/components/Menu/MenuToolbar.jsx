import React from 'react'

const MenuToolbar = ({ search, setSearch, sort, setSort }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      
      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher un menu..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full md:w-1/3"
      />

      {/* Tri */}
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full md:w-1/4"
      >
        <option value="">Trier par</option>
        <option value="nom">Nom</option>
        <option value="prix_asc">Prix croissant</option>
        <option value="prix_desc">Prix décroissant</option>
        <option value="categorie">Catégorie</option>
      </select>

    </div>
  )
}

export default MenuToolbar
