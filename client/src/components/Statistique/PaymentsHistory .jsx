const PaymentsHistory = ({ data }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="font-semibold mb-2">Historique des paiements</h3>

    <table className="w-full text-sm text-center">
      <thead>
        <tr>
          <th>Table</th>
          <th>Payer</th>
          <th>Rendu</th>
          <th>Type</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i}>
            <td>{p.nomtable}</td>
            <td>{p.payer} Ar</td>
            <td>{p.rendu} Ar</td>
            <td>{p.typepaiement}</td>
            <td>{new Date(p.date).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default PaymentsHistory
