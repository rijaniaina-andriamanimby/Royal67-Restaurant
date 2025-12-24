const CommandeToolbar = ({ search, setSearch, sort, setSort }) => (
  <div className="flex flex-col md:flex-row gap-4 mb-4">
    <input
      className="border rounded-lg px-4 py-2"
      placeholder="Rechercher par table..."
      value={search}
      onChange={e => setSearch(e.target.value)}
    />

    <select
      className="border rounded-lg px-4 py-2"
      value={sort}
      onChange={e => setSort(e.target.value)}
    >
      <option value="">Trier par</option>
      <option value="date_desc">Date récente</option>
      <option value="date_asc">Date ancienne</option>
      <option value="total_desc">Montant décroissant</option>
    </select>
  </div>
)

export default CommandeToolbar
