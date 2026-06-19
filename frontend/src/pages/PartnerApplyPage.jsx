import React, { useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Camera, Send, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import api from '../api/client';

const initialForm = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  district: '',
  vendorCategory: 'Photography',
  yearsOfExperience: '',
  description: '',
  password: '',
  portfolioImages: [],
  businessRegistration: null
};

export default function PartnerApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value, files } = event.target;
    if (name === 'portfolioImages') return setForm({ ...form, portfolioImages: [...files] });
    if (name === 'businessRegistration') return setForm({ ...form, businessRegistration: files[0] });
    setForm({ ...form, [name]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'portfolioImages') value.forEach((file) => data.append('portfolioImages', file));
        else if (key === 'businessRegistration' && value) data.append('businessRegistration', value);
        else if (value !== null) data.append(key, value);
      });

      await api.post('/vendor-applications', data);
      setMessage('Application submitted. Admin will review and approve your Celebrate.lk partner account.');
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="partner-page">
      <section className="partner-hero">
        <div>
          <span><Sparkles size={18} /> Join CelebrateLK Partner Network</span>
          <h1>Become a Verified Celebrate.lk Partner Vendor</h1>
          <p>Receive customer bookings, grow your visibility, showcase your portfolio and manage event requests online with a verified partner badge.</p>
          <div className="partner-benefits">
            <div><BadgeCheck /> Verified Partner Badge</div>
            <div><BriefcaseBusiness /> Manage Bookings</div>
            <div><Camera /> Showcase Portfolio</div>
            <div><ShieldCheck /> Company Reviewed</div>
          </div>
        </div>
      </section>

      <form className="partner-form" onSubmit={submit}>
        <h2>Apply to Join Celebrate.lk</h2>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}
        <div className="partner-form-grid">
          <input name="businessName" value={form.businessName} onChange={update} placeholder="Business Name" required />
          <input name="ownerName" value={form.ownerName} onChange={update} placeholder="Owner Name" required />
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Email" required />
          <input name="phone" value={form.phone} onChange={update} placeholder="Phone Number" required />
          <input name="district" value={form.district} onChange={update} placeholder="District" required />
          <select name="vendorCategory" value={form.vendorCategory} onChange={update}>
            {['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input name="yearsOfExperience" type="number" min="0" value={form.yearsOfExperience} onChange={update} placeholder="Years of Experience" />
          <input name="password" type="password" minLength="6" value={form.password} onChange={update} placeholder="Vendor Login Password" required />
        </div>
        <textarea name="description" value={form.description} onChange={update} placeholder="Describe your service, style, capacity and previous event experience" required />
        <div className="partner-upload-row">
          <label><Upload size={18} /> Portfolio Images<input name="portfolioImages" type="file" accept="image/*" multiple onChange={update} /></label>
          <label><Upload size={18} /> Business Registration Optional<input name="businessRegistration" type="file" accept="image/*,.pdf" onChange={update} /></label>
        </div>
        <button className="purple-cta" disabled={submitting} type="submit">
          {submitting ? 'Submitting...' : 'Submit Application'} <Send size={18} />
        </button>
      </form>
    </main>
  );
}
