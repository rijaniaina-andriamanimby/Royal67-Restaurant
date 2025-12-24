import React from 'react'
import {MdSearch} from 'react-icons/md'
const MenuToolbar = ({ search, setSearch, sort, setSort }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      
      {/* Recherche */}
      <div className='relative border rounded-lg px-4 py-2 w-full md:w-1/3 flex items-center justify-left gap-2'>
      <MdSearch size={20}/>
        <input
        type="text"
        placeholder="Rechercher un menu..."
        value={search}
        id='search'
        onChange={e => setSearch(e.target.value)}
        className='focus:outline-none w-full'
        autoComplete='off'
      />
      </div>

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
