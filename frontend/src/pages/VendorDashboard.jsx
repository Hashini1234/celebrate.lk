import React, { useEffect, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, CalendarCheck, CheckCircle2, ImagePlus, Phone, Plus, Star, Wallet, XCircle } from 'lucide-react';
import api, { uploadsBaseUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyService = { title: '', category: 'Photography', description: '', price: '', coverImage: '' };

export default function VendorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const response = await api.get('/vendor-portal/dashboard');
    setData(response.data);
  }

  async function addService(event) {
    event.preventDefault();
    await api.post('/vendor-portal/services', serviceForm);
    setServiceForm(emptyService);
    setMessage('Service package added.');
    loadDashboard();
  }

  async function deleteService(id) {
    await api.delete(`/vendor-portal/services/${id}`);
    setMessage('Service package deleted.');
    loadDashboard();
  }

  async function respondBooking(id, action) {
    await api.patch(`/vendor-portal/bookings/${id}/respond`, { action });
    setMessage(`Booking request ${action}ed.`);
    loadDashboard();
  }

  async function uploadPortfolio(event) {
    event.preventDefault();
    const formData = new FormData();
    portfolioFiles.forEach((file) => formData.append('images', file));
    await api.post('/vendor-portal/portfolio', formData);
    setPortfolioFiles([]);
    setMessage('Portfolio updated.');
    loadDashboard();
  }

  if (!data) return <main className="dashboard"><div className="screen-message">Loading vendor dashboard...</div></main>;

  return (
    <main className="dashboard vendor-dashboard">
      <section className="dash-hero vendor">
        <div>
          <span>Vendor Dashboard</span>
          <h1>{data.vendor.name}</h1>
          <p>{data.vendor.verified && <BadgeCheck size={18} />} Verified Celebrate.lk Partner Vendor | {user.email}</p>
        </div>
      </section>
      {message && <div className="success-box">{message}</div>}

      <div className="metric-row">
        <div><BriefcaseBusiness /><strong>{data.stats.totalRequests}</strong><span>Total Requests</span></div>
        <div><CheckCircle2 /><strong>{data.stats.acceptedBookings}</strong><span>Accepted Bookings</span></div>
        <div><CalendarCheck /><strong>{data.stats.upcomingEvents}</strong><span>Upcoming Events</span></div>
        <div><Wallet /><strong>LKR {Number(data.stats.totalEarnings).toLocaleString()}</strong><span>Total Earnings</span></div>
      </div>

      <section className="panel wide">
        <h2>Booking Requests</h2>
        <div className="request-card-grid">
          {data.bookings.length === 0 && <p className="muted">No assigned booking requests yet.</p>}
          {data.bookings.map((booking) => (
            <article key={booking._id}>
              <div>
                <strong>{booking.eventService?.title}</strong>
                <span>{booking.customer?.name} | {new Date(booking.eventDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}</span>
                <span><Phone size={13} /> {booking.customer?.phone || booking.customer?.email}</span>
              </div>
              <button onClick={() => respondBooking(booking._id, 'accept')} type="button"><CheckCircle2 size={16} /> Accept</button>
              <button onClick={() => respondBooking(booking._id, 'reject')} type="button"><XCircle size={16} /> Reject</button>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <form className="panel" onSubmit={addService}>
          <h2><Plus /> My Services</h2>
          <input placeholder="Package title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} required />
          <select value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}>
            {['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input placeholder="Price" type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} required />
          <input placeholder="Cover image URL" value={serviceForm.coverImage} onChange={(e) => setServiceForm({ ...serviceForm, coverImage: e.target.value })} />
          <textarea placeholder="Package description" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} required />
          <button className="primary-button" type="submit">Add Package</button>
        </form>

        <form className="panel" onSubmit={uploadPortfolio}>
          <h2><ImagePlus /> Portfolio Gallery</h2>
          <input type="file" accept="image/*" multiple onChange={(e) => setPortfolioFiles([...e.target.files])} />
          <button className="primary-button" type="submit">Upload Portfolio</button>
          <div className="portfolio-grid">
            {data.vendor.portfolioImages?.map((image) => <img key={image} src={`${uploadsBaseUrl}${image}`} alt="Vendor portfolio" />)}
          </div>
        </form>
      </div>

      <section className="panel wide">
        <h2>Service Packages</h2>
        <div className="mini-list">
          {data.services.map((service) => (
            <div key={service._id}>
              <strong>{service.title}</strong>
              <span>{service.category} | LKR {Number(service.price).toLocaleString()}</span>
              <button className="ghost-dark" onClick={() => deleteService(service._id)} type="button">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <h2><Star /> Reviews & Ratings</h2>
        <p className="muted">Overall Rating: {data.vendor.rating}/5 | Total Reviews will update as customers review completed vendor events.</p>
      </section>
    </main>
  );
}
