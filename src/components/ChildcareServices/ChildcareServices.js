import React from 'react';
import './ChildcareServices.scss';

// Importez vos images ici
import morningCareImage from '../../Assets/images/gardeMatin2.jpg';
import beforeSchoolImage from '../../Assets/images/gardeAvantEcole.jpg';
import afterSchoolImage from '../../Assets/images/gardeEcole.jpg';
import eveningCareImage from '../../Assets/images/gardeSoir.jpg';
import dayCareImage from '../../Assets/images/gardeJournee.jpg';
import housekeepingImage from '../../Assets/images/aideMenage.jpg';
import homeworkHelpImage from '../../Assets/images/aideDevoir.jpg';

const services = [
  { title: "Garde du matin", image: morningCareImage, description: "Prise en charge des enfants tôt le matin" },
  { title: "Garde avant l'école", image: beforeSchoolImage, description: "Préparation et accompagnement à l'école" },
  { title: "Garde après l'école", image: afterSchoolImage, description: "Récupération et activités après l'école" },
  { title: "Garde du soir", image: eveningCareImage, description: "Prise en charge en soirée jusqu'au coucher" },
  { title: "Garde à la journée", image: dayCareImage, description: "Garde complète pendant toute la journée" },
  { title: "Aide ménagère", image: housekeepingImage, description: "Entretien du domicile en plus de la garde" },
  { title: "Aide aux devoirs", image: homeworkHelpImage, description: "Soutien scolaire et aide aux devoirs" }
];

const ChildcareServices = () => {
  const handleServiceClick = (serviceTitle) => {
    // Ici, vous pourrez plus tard ajouter la logique pour la réservation
    console.log(`Service sélectionné : ${serviceTitle}`);
  };

  return (
    <section className="childcare-services">
      <h2>Nos types de services de remplacement</h2>
      
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card" onClick={() => handleServiceClick(service.title)}>
            <img src={service.image} alt={service.title} />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button>Réserver</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChildcareServices;