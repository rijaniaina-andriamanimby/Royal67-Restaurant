export function espaceChiffre(nombre) {
    return nombre.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}