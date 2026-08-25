import photoCliente from '../Assets/images/garde-enfant-acceuil.jpg';

/**
 * Profils des nounous disponibles pour la réservation.
 * Ajoutez ou modifiez les entrées ci-dessous (photo, parcours, diplômes…).
 */
export const NOUNOUS = [
  {
    id: 'sophie-eragny',
    prenom: 'Sophie',
    nom: 'Martin',
    photo: photoCliente,
    titre: 'Fondatrice — Nounou Chou Express',
    parcours:
      "Professionnelle de la petite enfance basée à Éragny, j'accompagne les familles et entreprises SAP depuis plus de 10 ans. Spécialisée en garde d'urgence et remplacement de dernière minute, je veille au bien-être et à la sécurité de chaque enfant.",
    diplomes: ['CAP Petite Enfance', 'BAFA', 'PSC1'],
  },
  {
    id: 'julie-valdoise',
    prenom: 'Julie',
    nom: 'Bernard',
    photo: null,
    titre: 'Nounou certifiée',
    parcours:
      "8 ans d'expérience en garde à domicile et en crèche. Julie intervient sur Éragny et les communes voisines pour les gardes du matin, du soir et les remplacements urgents.",
    diplomes: ['CAP Petite Enfance', 'BAFD'],
  },
  {
    id: 'camille-express',
    prenom: 'Camille',
    nom: 'Dupont',
    photo: null,
    titre: 'Assistante maternelle agréée',
    parcours:
      "Camille propose un accompagnement bienveillant et des activités adaptées à l'âge de chaque enfant. Habituée aux gardes express et aux besoins des familles actives.",
    diplomes: ['Diplôme d\'État Accompagnant Éducatif Petite Enfance', 'BAFA'],
  },
];

export const getNounouById = (id) => NOUNOUS.find((n) => n.id === id);

export const getNounouFullName = (id) => {
  const nounou = getNounouById(id);
  return nounou ? `${nounou.prenom} ${nounou.nom}` : '';
};
