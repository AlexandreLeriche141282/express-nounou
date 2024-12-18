import React, { useState } from 'react';
import './ChildcareServices.scss';
import ReservationModal from '../Reservation-modal/Reservation-modal';

// Importez vos images ici
import morningCareImage from '../../Assets/images/gardeMatin2.avif';
import beforeSchoolImage from '../../Assets/images/gardeAvantEcole.avif';
import afterSchoolImage from '../../Assets/images/grade-ecole.avif';
import eveningCareImage from '../../Assets/images/garde-soir.avif';
import dayCareImage from '../../Assets/images/grade-journee.avif';
import housekeepingImage from '../../Assets/images/aide-menage.avif';
import homeworkHelpImage from '../../Assets/images/grade-devoir.avif';

const services = [
  { 
    title: "Garde du matin", 
    image: morningCareImage, 
    description: "Prise en charge des enfants tôt le matin",
    altText: "Nounou accompagnant un enfant le matin"
  },
  { 
    title: "Garde avant l'école", 
    image: beforeSchoolImage, 
    description: "Préparation et accompagnement à l'école",
    altText: "Préparation des enfants avant l'école"
  },
  { 
    title: "Garde après l'école", 
    image: afterSchoolImage, 
    description: "Récupération et activités après l'école",
    altText: "Activités périscolaires avec des enfants"
  },
  { 
    title: "Garde du soir", 
    image: eveningCareImage, 
    description: "Prise en charge en soirée jusqu'au coucher",
    altText: "Garde d'enfants en soirée"
  },
  { 
    title: "Garde à la journée", 
    image: dayCareImage, 
    description: "Garde complète toute la journée",
    altText: "Garde d'enfants à la journée complète"
  },
  { 
    title: "Aide ménagère", 
    image: housekeepingImage, 
    description: "Entretien du domicile",
    altText: "Femme de ménage faisant l'entretien"
  },
  { 
    title: "Aide aux devoirs", 
    image: homeworkHelpImage, 
    description: "Soutien scolaire et aide aux devoirs",
    altText: "Enfant travaillant avec un accompagnant scolaire"
  }
];

const ChildcareServices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceClick = (serviceTitle) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitReservation = (reservationData) => {
    console.log('Réservation soumise:', { service: selectedService, ...reservationData });
    setIsModalOpen(false);
    // Ici, vous pouvez ajouter la logique pour traiter la réservation
  };

  return (
    <section 
      className="childcare-services" 
      id="reservation-particuliers"
      aria-labelledby="services-title"
    >
      <h2 id="services-title">Nos types de services de remplacement</h2>
      
      <div className="services-grid">
        {services.map((service) => (
          <article 
            key={service.title} 
            className="service-card"
            aria-label={`Service de ${service.title}`}
          >
            <img 
              src={service.image} 
              alt={service.altText || service.title}
              loading="lazy"
              width="300"
              height="200"
            />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button 
              onClick={() => handleServiceClick(service.title)}
              aria-label={`Réserver le service ${service.title}`}
            >
              Réserver
            </button>
          </article>
        ))}
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReservation}
        selectedService={selectedService}
      />
    </section>
  );
};

export default ChildcareServices;