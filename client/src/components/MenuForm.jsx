import React, { useState } from 'react'
import api from '../service/api';

const MenuForm = ({ menu, setMenuList, list }) => {
    const [nom, setNom] = useState(menu?.nom || '');
    const [categorie, setCategorie] = useState(menu?.categorie || '');
    const [prix, setPrix] = useState(menu?.prix || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (menu) {
            try {
                const response = await api.put('/menu/ '+ menu.id, {
                    nom, categorie, prix
                })
                setMenuList((prev) => (
                    prev.id === menu.id ? response.data : prev
                ));
            } catch (error) {
                console.log(error)
            }
        } else {
            try {
                const response = await api.post('/menu', {
                    nom, categorie, prix
                });
                setMenuList([
                    ...list,response.data
                ])
            } catch (error) {
                console.log(error)
            }
        }
    }
    return (
        <div>
            <div>
                <h1>
                    Ajouter un menu
                </h1>
                <p>Ajouter un nouveau menu disponible dans votre restaurant</p>
            </div>
            <form onSubmit={handleSubmit} autoComplete='off'>
                <div>
                    <label htmlFor="nom">Nom</label>
                    <input
                        type="text"
                        name="nom"
                        id="nom"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className='border'
                    />
                </div>
                <div>
                    <label htmlFor="categorie">Categorie</label>
                    <input
                        type="text"
                        name='categorie'
                        id='categorie'
                        list='liste'
                        className='border'
                        autoComplete='on'
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value)}
                    />
                    <datalist id='liste'>
                        <option value="Boisson"></option>
                        <option value="Soupe"></option>
                        <option value="Steak"></option>
                    </datalist>
                </div>
                <div>
                    <label htmlFor="prix">Prix</label>
                    <input
                        type="text"
                        name='prix'
                        id='prix'
                        className='border'
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                    />
                </div>
                <div>
                    <button type='submit'>
                        {menu.id ? 'Modifier' : 'Ajouter'}
                    </button>
                    <button>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MenuForm
