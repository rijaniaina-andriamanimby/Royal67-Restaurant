CREATE DATABASE restaurant;

CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    prix INT
);

CREATE TABLE commande(
    ref VARCHAR(10) NOT NULL PRIMARY KEY,
    nom_table VARCHAR(20),
    date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE commandeDetail(
    id SERIAL PRIMARY KEY,
    ref_commande VARCHAR(10) REFERENCES commande(ref) ON DELETE CASCADE ON UPDATE CASCADE,
    id_menu INT REFERENCES menu(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantite INT
);

CREATE TABLE paiement(
    id SERIAL PRIMARY KEY,
    payer INT NOT NULL,
    rendu INT NOT NULL,
    type_paiment VARCHAR(20)
);