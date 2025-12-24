export const groupCommande = (data) => {
  const map = {}

  data.forEach(item => {
    if (!map[item.id]) {
      map[item.id] = {
        id: item.id,
        nomTable: item.nomtable,
        date: item.date,
        paiement: {
          payer: item.payer,
          rendu: item.rendu,
          typePaiement: item.typepaiement
        },
        details: []
      }
    }

    map[item.id].details.push({
      nom: item.nom,
      categorie: item.categorie,
      prix: item.prix,
      quantite: item.quantite
    })
  })

  return Object.values(map)
}
