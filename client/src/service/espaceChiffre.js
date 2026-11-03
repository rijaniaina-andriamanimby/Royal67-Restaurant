const espaceChiffre = (nombre) => {
    const valeur = Number(nombre ?? 0)

    return valeur.toLocaleString("fr-FR")
}

export default espaceChiffre