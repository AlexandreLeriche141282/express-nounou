import React from 'react';
import styles from './CMG.module.scss';

const CMG = () => {
  return (
    <section className={styles.cmg} id="cmg">
      <div className={styles.container}>
        <h2>Le Complément de libre choix du mode de garde (CMG)</h2>
        <p className={styles.intro}>
          En tant que particulier employeur, vous pouvez bénéficier du CMG pour réduire le coût
          de votre garde d'enfants à domicile.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Qu'est-ce que le CMG ?</h3>
            <p>
              Le CMG est une aide financière versée par la CAF pour les parents qui emploient
              une assistante maternelle ou une garde d'enfants à domicile. Il couvre une partie
              des frais de garde et des cotisations sociales.
            </p>
          </div>

          <div className={styles.card}>
            <h3>Conditions d'éligibilité</h3>
            <p>
              Pour bénéficier du CMG, vous devez employer une garde à domicile et réaliser
              <strong> au minimum 16 heures de garde par mois</strong>. Le montant de l'aide
              dépend de vos revenus et de la composition de votre foyer.
            </p>
          </div>

          <div className={styles.card}>
            <h3>Comment en bénéficier ?</h3>
            <p>
              Déclarez votre garde sur le site de la CAF ou via votre espace personnel.
              L'aide est versée directement sur votre compte bancaire, en général chaque mois.
            </p>
            <a
              href="https://www.caf.fr/allocataires/mes-demarches-et-services/detail?topic=&servicePath=/allocataires/mes-demarches-et-services/detail&contentPath=/allocataires/mes-demarches-et-services/detail&service=cmg"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              En savoir plus sur caf.fr →
            </a>
          </div>
        </div>

        <p className={styles.note}>
          Tarif horaire : <strong>29,99 €/heure</strong> — À partir de 16 h de garde dans le mois,
          vous pouvez prétendre au CMG pour alléger vos dépenses.
        </p>
      </div>
    </section>
  );
};

export default CMG;
