import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../config/firebase';
import './Contact.css';

function Contact() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'contact'));
        // Assume only one doc in the collection
        const doc = snapshot.docs[0]?.data();
        setContact(doc);
      } catch (err) {
        setContact(null);
      }
      setLoading(false);
    };
    fetchContact();
  }, []);

  return (
    <>
      <div className="contact-bg" />
      <div className="contact-page">
        <div className="contact-info">
          <h2>{t('contactUs')}</h2>
          <div className="contact-subtitle">{t('getInTouch')}</div>
          {loading ? (
            <div className="contact-loading">{t('loading')} {t('contact').toLowerCase()} {t('info').toLowerCase()}...</div>
          ) : !contact ? (
            <div className="contact-error">{t('contact')} {t('info').toLowerCase()} {t('notAvailable').toLowerCase()}.</div>
          ) : (
            <div className="contact-details">
              <div className="contact-detail">
                <span><i className="fab fa-instagram"></i></span>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
              <div className="contact-detail">
                <span><i className="fab fa-facebook"></i></span>
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              </div>
              <div className="contact-detail">
                <span><i className="fab fa-whatsapp"></i></span>
                <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
              <div className="contact-detail">
                <span><i className="fas fa-envelope"></i></span>
                <a href={`mailto:${contact.mail}`}>{contact.mail}</a>
              </div>
              <div className="contact-detail">
                <span><i className="fas fa-phone"></i></span>
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Contact; 