import React, { useState } from 'react';
import styles from './ChildcareReservationModal.module.scss';

const ReservationModal = ({ isOpen, onClose, onSubmit, selectedService }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    childFirstName: '',
    childLastName: '',
    childAge: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    guardDate: '',
    startTime: '',
    endTime: '',
    specialNeeds: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ service: selectedService, ...formData });
    onClose();
  };

  const questions = [
    {
      title: "Informations sur le parent",
      fields: [
        { name: "parentFirstName", placeholder: "Prénom du parent", type: "text" },
        { name: "parentLastName", placeholder: "Nom du parent", type: "text" },
        { name: "email", placeholder: "Email", type: "email" },
        { name: "phone", placeholder: "Numéro de téléphone", type: "tel" },
      ]
    },
    {
      title: "Informations sur l'enfant",
      fields: [
        { name: "childFirstName", placeholder: "Prénom de l'enfant", type: "text" },
        { name: "childLastName", placeholder: "Nom de l'enfant", type: "text" },
        { name: "childAge", placeholder: "Âge de l'enfant", type: "number" },
      ]
    },
    {
      title: "Adresse",
      fields: [
        { name: "address", placeholder: "Adresse", type: "text" },
        { name: "city", placeholder: "Ville", type: "text" },
        { name: "postalCode", placeholder: "Code postal", type: "text" },
      ]
    },
    {
      title: "Détails de la garde",
      fields: [
        { name: "guardDate", placeholder: "Date de garde", type: "date" },
        { name: "startTime", placeholder: "Heure de début", type: "time" },
        { name: "endTime", placeholder: "Heure de fin", type: "time" },
        { name: "specialNeeds", placeholder: "Besoins spécifiques ou commentaires", type: "textarea" },
      ]
    },
  ];

  if (!isOpen) return null;

  const currentQuestion = questions[step];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Réservation - {selectedService}</h2>
        <form onSubmit={handleSubmit}>
          <h3>{currentQuestion.title}</h3>
          {currentQuestion.fields.map((field, index) => (
            <div key={index} className={styles.formRow}>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          ))}
          <div className={styles.formActions}>
            {step > 0 && (
              <button type="button" onClick={handlePrevious}>Précédent</button>
            )}
            {step < questions.length - 1 ? (
              <button type="button" onClick={handleNext}>Suivant</button>
            ) : (
              <button type="submit">Réserver</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
