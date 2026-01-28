import { CreditCard, Calendar, DollarSign, MoreVertical } from "lucide-react"
import { espaceChiffre } from "../../service/espaceChiffre"

const PaymentsHistory = ({ data }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-x-auto">
    <div className="flex items-center gap-3 mb-4">
      <CreditCard className="w-5 h-5 text-blue-600" />
      <h3 className="font-bold text-lg text-gray-900">Historique des paiements</h3>
    </div>

    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Table</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant payé</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Rendu</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4 text-gray-900 font-medium">{p.nomtable}</td>
            <td className="py-3 px-4 text-gray-900 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              {espaceChiffre(p.payer)} Ar
            </td>
            <td className="py-3 px-4 text-gray-900">{espaceChiffre(p.rendu)} Ar</td>
            <td className="py-3 px-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  p.typepaiement === "Espèce" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                }`}
              >
                {p.typepaiement}
              </span>
            </td>
            <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(p.date).toLocaleString("fr-FR")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default PaymentsHistory
