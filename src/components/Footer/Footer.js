import React, { useState } from 'react';
import styles from './Footer.module.scss';
import logoDev from '../../Assets/images/logoPikcel2.svg';
import logo from '../../Assets/logo2-removebg-preview.png';
import Modal from '../Modal/Modal';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <a href="/" className={styles.logo}>
            <img src={logo} alt="Logo de l'entreprise" />
          </a>
        </div>
        <nav className={styles.footerNav}>
          <ul>
            <li><a href="#a-propos">À propos</a></li>
            <li><a href="#reservation-particuliers">Réservation particuliers</a></li>
            <li><a href="#entreprises-sap">Entreprises SAP</a></li>
            <li><a href="#footer">Contact</a></li>
          </ul>
        </nav>
        <div className={styles.footerContact}>
          <p>Contactez-nous : 06 66 28 72 91</p>
          <p>Email : contact@expressnounou.fr</p>
        </div>
        <div className={styles.legalMentions}>
          <h3>Mentions Légales</h3>
          <p>
            Pour plus d'informations sur nos conditions d'utilisation et notre
            politique de confidentialité, veuillez consulter nos mentions légales.
          </p>
          <p>
            <a href="#mentions-legales" onClick={openModal}>Voir les mentions légales</a>
          </p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Express Nounou. Tous droits réservés.</p>
        <div className={styles.devInfo}>
  <span className={styles.devText}>Site réalisé par </span>
  <a href="https://www.pikcel.fr" target="_blank" rel="noopener noreferrer">
    <img src={logoDev} alt="logo de l'agence Pikcel, agence web à Denain et Valenciennes, création de sites internet" className={styles.logoDev} />
  </a>
</div>


      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
  <h2>Mentions Légales</h2>
  <p><strong>Nom de l'entreprise</strong> : Express Nounou</p>
  <p><strong>Forme juridique</strong> : Entreprise individuelle</p>
  <p><strong>Numéro SIRET</strong> : 89298641500016</p>
  <p><strong>Adresse</strong> : 95610 Éragny</p>
  <p><strong>Téléphone</strong> : 06 66 28 72 91</p>
  <p><strong>Email</strong> : contact@expressnounou.fr</p>
  
  <p><strong>Site réalisé par</strong> : pikcel.fr</p>
  
  <p><strong>Hébergeur</strong> : Hostinger</p>
  <p><strong>Adresse de l'hébergeur</strong> : Hostinger International, 61-63, RUE DE LA VICTOIRE, Paris, 75009, France</p>
  <p><strong>Téléphone de l'hébergeur</strong> : +33 1 70 18 99 10</p>

  <p><strong>Droits d'auteur</strong> : Le site et tout son contenu (y compris les images, logos, et textes) sont protégés par des droits d’auteur détenus par Pikcel.fr.</p>

  <p><strong>Collecte de données personnelles</strong> : Nous collectons des données personnelles telles que les noms, prénoms, adresses, numéros de téléphone et emails des utilisateurs. Ces informations sont utilisées uniquement pour la gestion des services proposés et ne seront pas partagées avec des tiers sans votre consentement.</p>
  
</Modal>

    </footer>
  );
};

export default Footer;

