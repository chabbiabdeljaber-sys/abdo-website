import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Contact.css';

function Contact() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <h2>Contact Us</h2>
          <div className="contact-subtitle">We'd love to hear from you! Reach out to us on social or directly.</div>
          {loading ? (
            <div className="contact-loading">Loading contact info...</div>
          ) : !contact ? (
            <div className="contact-error">Contact info not available.</div>
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