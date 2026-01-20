CREATE DATABASE restaurant;

CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    categorie INT NOT NULL,
    prix INT
);

CREATE TABLE commande(
    id SERIAL PRIMARY KEY,
    nomTable VARCHAR(20),
    date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE commandeDetail(
    id SERIAL PRIMARY KEY,
    idCommande INT REFERENCES commande(id) ON DELETE CASCADE ON UPDATE CASCADE,
    idMenu INT REFERENCES menu(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantite INT
);

CREATE TABLE paiement(
    id SERIAL PRIMARY KEY,
    payer INT NOT NULL,
    rendu INT NOT NULL,
    typePaiment VARCHAR(20),
    idCommande INT REFERENCES commande(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE categorie(
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50)
);

alter table menu add constraint fk_menu_categorie foreign key (categorie) references categorie(id) ON DELETE CASCADE ON UPDATE CASCADE;