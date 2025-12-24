const TableCommande = ({ commandes }) => (
  <table className="w-full bg-white shadow rounded-lg text-center">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3">Table</th>
        <th>Date</th>
        <th>Menus</th>
        <th>Prix unitaire</th>
        <th>Qte</th>
        <th>Total</th>
        <th>Paiement</th>
      </tr>
    </thead>
    <tbody>
      {commandes.map(cmd => (
        <tr key={cmd.id} className="border-t">
          <td className="p-3">{cmd.nomTable}</td>
          <td>{new Date(cmd.date).toLocaleString('fr-FR',{
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</td>
          <td>
            {cmd.details.map((d, i) => (
              <div key={i}>
                {d.nom} X{d.quantite}
              </div>
            ))}
          </td>
          <td>
            {cmd.details.map((d,i)=>(
              <p key={i}>{d.prix} Ar</p>
            ))}
          </td>
          <td>
            {cmd.details.map((d,i)=>(
              <p key={i}>{d.quantite}</p>
            ))}
          </td>
          <td className="font-semibold">
            {cmd.details.reduce((s, d) => s + d.prix * d.quantite, 0)} Ar
          </td>
          <td>{cmd.paiement.typePaiement}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export default TableCommande
