// ChildcareServices.jsx
import React, { useState } from 'react';
import './ChildcareServices.scss';
import ReservationModal from '../Reservation-modal/Reservation-modal';

// Importez vos images ici
import morningCareImage from '../../Assets/images/gardeMatin2.jpg';
import beforeSchoolImage from '../../Assets/images/gardeAvantEcole.jpg';
import afterSchoolImage from '../../Assets/images/grade-ecole.jpg';
import eveningCareImage from '../../Assets/images/garde-soir.avif';
import dayCareImage from '../../Assets/images/grade-journee.avif';
import housekeepingImage from '../../Assets/images/aide-menage.jpg';
import homeworkHelpImage from '../../Assets/images/grade-devoir.avif';

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
    <section className="childcare-services">
      <h2>Nos types de services de remplacement</h2>
      
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.title} />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button onClick={() => handleServiceClick(service.title)}>Réserver</button>
          </div>
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