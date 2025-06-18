import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './AdminLayout.css';

function AdminContact() {
  const [contactId, setContactId] = useState(null);
  const [form, setForm] = useState({
    facebook: '',
    instagram: '',
    mail: '',
    phone: '',
    whatsapp: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'contact'));
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setContactId(docSnap.id);
          setForm(docSnap.data());
        }
      } catch (err) {
        setError('Failed to load contact info.');
      }
      setLoading(false);
    };
    fetchContact();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      if (contactId) {
        await updateDoc(doc(db, 'contact', contactId), form);
        setSuccess(true);
      } else {
        setError('No contact document found.');
      }
    } catch (err) {
      setError('Failed to update contact info.');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="admin-contact-page" style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(25,118,210,0.07)', padding: '2.5rem 2rem' }}>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: '1.5rem' }}>Edit Contact Info</h2>
        {loading ? (
          <div>Loading contact info...</div>
        ) : (
          <form onSubmit={handleSave} className="admin-contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <label>
              Instagram
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="Instagram URL" />
            </label>
            <label>
              Facebook
              <input name="facebook" value={form.facebook} onChange={handleChange} placeholder="Facebook URL" />
            </label>
            <label>
              WhatsApp
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp URL" />
            </label>
            <label>
              Email
              <input name="mail" value={form.mail} onChange={handleChange} placeholder="Email address" type="email" />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
            </label>
            {error && <div style={{ color: '#c62828', fontWeight: 500 }}>{error}</div>}
            {success && <div style={{ color: '#2e7d32', fontWeight: 600 }}>Contact info updated!</div>}
            <button type="submit" className="admin-contact-save-btn" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.9rem 0', fontWeight: 700, fontSize: '1.08rem', marginTop: '0.7rem', cursor: 'pointer' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminContact; 