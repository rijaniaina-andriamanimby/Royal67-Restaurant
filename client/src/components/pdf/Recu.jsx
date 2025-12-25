import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  center: { textAlign: "center" },
  line: { marginVertical: 5, borderBottom: "1px dashed #000" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "bold" }
});

const Recu = ({ idCommande, data }) => {
  const date = new Date().toLocaleString();

  const total = data.commandeDetail.reduce(
    (s, p) => s + p.prix * p.quantite,
    0
  );

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <Text style={styles.center}>Tiko'Resto</Text>
        <View style={styles.line} />

        <Text>Date : {date}</Text>
        <Text>Vente : C{String(idCommande).padStart(5, "0")}</Text>
        <Text>Client : Divers</Text>

        <View style={styles.line} />
        <Text style={styles.bold}>DÉTAIL</Text>

        {data.commandeDetail.map((item, i) => (
          <View key={i}>
            <View style={styles.row}>
              <Text>{item.nom}</Text>
              <Text>{item.prix * item.quantite} Ar</Text>
            </View>
            <Text>
              {item.prix} x {item.quantite}
            </Text>
          </View>
        ))}

        <View style={styles.line} />

        <View style={styles.row}>
          <Text style={styles.bold}>TOTAL</Text>
          <Text style={styles.bold}>{total} Ar</Text>
        </View>

        <View style={styles.row}>
          <Text>PAYÉ</Text>
          <Text>{data.payer} Ar</Text>
        </View>

        <View style={styles.row}>
          <Text>RENDU</Text>
          <Text>{data.rendu} Ar</Text>
        </View>

        <Text>PAIEMENT : {data.typePaiement}</Text>
        <Text>CAISSE : Caisse N1</Text>

        <View style={styles.line} />

        <Text style={styles.center}>— Merci de votre visite —</Text>
      </Page>
    </Document>
  );
};

export default Recu;
