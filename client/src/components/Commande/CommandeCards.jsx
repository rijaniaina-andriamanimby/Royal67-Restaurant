const CommandeCards = ({ commandes }) => (
  <div className="grid gap-4 md:hidden">
    {commandes.map(cmd => (
      <div key={cmd.id} className="bg-white shadow rounded-xl p-4">
        <h3 className="font-semibold">Table : {cmd.nomTable}</h3>
        <p className="text-sm text-gray-500">
          {new Date(cmd.date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        <div className="mt-2">
          {cmd.details.map((d, i) => (
            <div key={i}>
              {d.nom} x{d.quantite}
            </div>
          ))}
        </div>

        <p className="mt-2 font-bold text-emerald-600">
          Total : {cmd.details.reduce((s, d) => s + d.prix * d.quantite, 0)} Ar
        </p>
      </div>
    ))}
  </div>
)

export default CommandeCards
