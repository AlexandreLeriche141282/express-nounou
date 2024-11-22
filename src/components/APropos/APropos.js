import React from 'react';
import styles from './APropos.module.scss';
import photoCliente from '../../Assets/images/GE.jpg'; // Assurez-vous d'avoir cette image

const APropos = () => {
  return (
    <section className={styles.aPropos} id="a-propos">
      <div className={styles.container}>
        <div className={styles.photoContainer}>
          <img src={photoCliente} alt="Votre nom" className={styles.photo} />
        </div>
        <div className={styles.textContainer}>
          <h2>À Propos de Moi</h2>
          <p>
            Bonjour, je suis [Votre Nom], spécialiste en garde d'enfants de dernière minute. 
            Avec plus de [X] années d'expérience dans le domaine de la petite enfance, 
            je suis passionnée par le bien-être et l'épanouissement des enfants.
          </p>
          <p>
            Mes services incluent :
          </p>
          <ul>
            <li>Garde d'urgence 24/7</li>
            <li>Activités éducatives et ludiques</li>
            <li>Aide aux devoirs</li>
            <li>Préparation de repas équilibrés</li>
          </ul>
          <p>
            Je m'adapte aux besoins spécifiques de chaque famille pour offrir un service 
            personnalisé et de qualité. Votre tranquillité d'esprit et le bonheur de vos 
            enfants sont ma priorité.
          </p>
        </div>
      </div>
    </section>
  );
};

export default APropos;