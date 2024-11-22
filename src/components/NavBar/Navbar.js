import React from 'react';
import styles from './Navbar.module.scss';
import logo from '../../Assets/images/logo.png';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <a href="/" className={styles.logo}>
          {/* Remplacez par votre logo quand disponible */}
          <img src={logo} alt="Logo de l'entreprise" />
        </a>
      </div>
      <div className={styles.navbarRight}>
        <ul className={styles.navLinks}>
          <li><a href="#a-propos">À propos</a></li>
          <li><a href="#reservation-particuliers">Réservation particuliers</a></li>
          <li><a href="#entreprises-sap">Entreprises SAP</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;