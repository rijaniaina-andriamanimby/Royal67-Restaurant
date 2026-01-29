-- Index pour améliorer les recherches par nom dans le menu
CREATE INDEX idx_menu_nom ON menu(nom);

-- Index pour accélérer le filtrage par catégorie
CREATE INDEX idx_menu_categorie ON menu(categorie);

-- Index pour les recherches par table
CREATE INDEX idx_commande_nomTable ON commande(nomTable);

-- Index pour le tri et le filtrage par date (utilisé dans les stats)
CREATE INDEX idx_commande_date ON commande(date);

-- Index sur les clés étrangères pour accélérer les jointures
CREATE INDEX idx_commandeDetail_idCommande ON commandeDetail(idCommande);
CREATE INDEX idx_commandeDetail_idMenu ON commandeDetail(idMenu);
CREATE INDEX idx_paiement_idCommande ON paiement(idCommande);
