import React from 'react';
import { CalendarCheck, CheckCircle2, Plus, Search, Store, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api, { uploadsBaseUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const emptyEvent = {
  title: '',
  category: 'Wedding',
  description: '',
  basePrice: '',
  coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
  inclusions: ''
};

const emptyVendor = {
  name: '',
  serviceType: 'Venue',
  email: '',
  phone: '',
  location: '',
  pricePerEvent: ''
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [freeVendors, setFreeVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [vendorForm, setVendorForm] = useState(emptyVendor);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState('');
  const [message, setMessage] = useState('');

  const booking = useMemo(() => bookings.find((item) => item._id === selectedBooking), [bookings, selectedBooking]);
  const pendingBookings = useMemo(() => bookings.filter((item) => item.status === 'pending' || item.status === 'vendor_assigned'), [bookings]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [eventsRes, vendorsRes, bookingsRes] = await Promise.all([api.get('/events'), api.get('/vendors'), api.get('/bookings')]);
    setEvents(eventsRes.data);
    setVendors(vendorsRes.data);
    setBookings(bookingsRes.data);
  }

  async function addEvent(event) {
    event.preventDefault();
    await api.post('/events', {
      ...eventForm,
      basePrice: Number(eventForm.basePrice),
      inclusions: eventForm.inclusions.split(',').map((item) => item.trim()).filter(Boolean)
    });
    setMessage('Event package added.');
    setEventForm(emptyEvent);
    loadData();
  }

  async function addVendor(event) {
    event.preventDefault();
    await api.post('/vendors', { ...vendorForm, pricePerEvent: Number(vendorForm.pricePerEvent) });
    setMessage('Vendor added.');
    setVendorForm(emptyVendor);
    loadData();
  }

  async function checkFreeVendors(targetBooking = booking) {
    if (!targetBooking) return;
    const { data } = await api.get(`/vendors?date=${targetBooking.eventDate}`);
    setFreeVendors(data);
    setMessage('Available vendors loaded for the selected event date.');
  }

  async function assignVendors(event) {
    event.preventDefault();
    await api.patch(`/bookings/${selectedBooking}/vendors`, {
      vendorIds: selectedVendors,
      estimatedTotal: Number(estimatedTotal || booking.estimatedTotal),
      adminMessage: 'Vendors assigned. Please wait for final approval.'
    });
    setMessage('Vendors assigned to booking.');
    setSelectedVendors([]);
    setEstimatedTotal('');
    await loadData();
  }

  async function updateStatus(id, status) {
    await api.patch(`/bookings/${id}/status`, {
      status,
      adminMessage: status === 'approved' ? 'Your booking is approved. You can upload half or full payment now.' : 'Booking status updated.'
    });
    setMessage(`Booking ${status}. Customer email notification is sent when approved.`);
    loadData();
  }

  async function verifyPayment(id) {
    await api.patch(`/bookings/${id}/payments/verify`);
    setMessage('Payment verified. Customer booking status is now payment completed/event confirmed.');
    loadData();
  }

  return (
    <main className="dashboard admin-dashboard">
      <section className="dash-hero admin">
        <div>
          <span>Admin Panel</span>
          <h1>Welcome, {user.name}</h1>
          <p>Manage event packages, vendors, customer booking requests, approvals and uploaded bank slips.</p>
        </div>
      </section>

      {message && <div className="success-box">{message}</div>}

      <div className="metric-row">
        <div><CalendarCheck /><strong>{bookings.length}</strong><span>Total bookings</span></div>
        <div><Store /><strong>{vendors.length}</strong><span>Active vendors</span></div>
        <div><CheckCircle2 /><strong>{bookings.filter((item) => item.status === 'approved').length}</strong><span>Approved</span></div>
        <div><CalendarCheck /><strong>{bookings.filter((item) => item.status === 'completed').length}</strong><span>Completed</span></div>
      </div>

      <section className="panel wide admin-request-strip">
        <h2><Search /> New Booking Requests</h2>
        {pendingBookings.length === 0 ? (
          <p className="muted">No pending customer booking requests right now.</p>
        ) : (
          <div className="request-card-grid">
            {pendingBookings.slice(0, 4).map((item) => (
              <article key={item._id}>
                <div>
                  <strong>{item.eventService?.title}</strong>
                  <span>{item.customer?.name} | {new Date(item.eventDate).toLocaleDateString()} | {item.startTime || '--:--'} - {item.endTime || '--:--'}</span>
                </div>
                <StatusBadge status={item.status} />
                <button onClick={() => updateStatus(item._id, 'approved')} type="button">
                  <CheckCircle2 size={16} /> Approve
                </button>
                {item.payments?.length > 0 && (
                  <button onClick={() => verifyPayment(item._id)} type="button">
                    <CheckCircle2 size={16} /> Verify Payment
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="dashboard-grid">
        <form className="panel" onSubmit={addEvent}>
          <h2><Plus /> Add Event</h2>
          <input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
          <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
            {['Wedding', 'Birthday', 'Engagement', 'Corporate', 'Festival', 'Meeting', 'Other'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input placeholder="Base price" type="number" value={eventForm.basePrice} onChange={(e) => setEventForm({ ...eventForm, basePrice: e.target.value })} required />
          <input placeholder="Cover image URL" value={eventForm.coverImage} onChange={(e) => setEventForm({ ...eventForm, coverImage: e.target.value })} required />
          <textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
          <input placeholder="Inclusions comma separated" value={eventForm.inclusions} onChange={(e) => setEventForm({ ...eventForm, inclusions: e.target.value })} />
          <button className="primary-button" type="submit">Add Event</button>
        </form>

        <form className="panel" onSubmit={addVendor}>
          <h2><Store /> Add Vendor</h2>
          <input placeholder="Vendor name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} required />
          <select value={vendorForm.serviceType} onChange={(e) => setVendorForm({ ...vendorForm, serviceType: e.target.value })}>
            {['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input placeholder="Email" type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} required />
          <input placeholder="Phone" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} required />
          <input placeholder="Location" value={vendorForm.location} onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })} required />
          <input placeholder="Price per event" type="number" value={vendorForm.pricePerEvent} onChange={(e) => setVendorForm({ ...vendorForm, pricePerEvent: e.target.value })} />
          <button className="primary-button" type="submit">Add Vendor</button>
        </form>
      </div>

      <section className="panel wide">
        <h2><Search /> Booking Requests</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Customer</th><th>Event</th><th>Date & Time</th><th>Status</th><th>Payments</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bookings.map((item) => (
                <tr key={item._id}>
                  <td>{item.customer?.name}<small>{item.customer?.email}</small></td>
                  <td>{item.eventService?.title}</td>
                  <td>{new Date(item.eventDate).toLocaleDateString()}<small>{item.startTime || '--:--'} - {item.endTime || '--:--'}</small></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {item.payments?.length ? item.payments.map((pay) => (
                      <a key={pay._id} href={`${uploadsBaseUrl}${pay.slipUrl}`} target="_blank">{pay.type} slip ({pay.status})</a>
                    )) : 'No slip'}
                  </td>
                  <td className="action-row">
                    <button onClick={() => { setSelectedBooking(item._id); checkFreeVendors(item); }} type="button">Assign</button>
                    <button disabled={item.status === 'approved'} onClick={() => updateStatus(item._id, 'approved')} type="button"><CheckCircle2 size={16} /> Approve</button>
                    <button disabled={!item.payments?.length || item.status === 'completed'} onClick={() => verifyPayment(item._id)} type="button"><CheckCircle2 size={16} /> Verify Payment</button>
                    <button disabled={item.status === 'completed'} onClick={() => updateStatus(item._id, 'completed')} type="button"><CalendarCheck size={16} /> Confirm Event</button>
                    <button onClick={() => updateStatus(item._id, 'rejected')} type="button"><XCircle size={16} /> Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form className="panel wide" onSubmit={assignVendors}>
        <h2>Assign Free Vendors</h2>
        <select value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)} required>
          <option value="">Select booking</option>
          {bookings.map((item) => <option key={item._id} value={item._id}>{item.customer?.name} - {item.eventService?.title}</option>)}
        </select>
        <button className="ghost-dark" type="button" onClick={() => checkFreeVendors()}>Check free vendors for date</button>
        <div className="vendor-picker">
          {freeVendors.map((vendor) => (
            <label key={vendor._id}>
              <input
                type="checkbox"
                checked={selectedVendors.includes(vendor._id)}
                onChange={(e) => setSelectedVendors(e.target.checked ? [...selectedVendors, vendor._id] : selectedVendors.filter((id) => id !== vendor._id))}
              />
              <span>{vendor.name}</span>
              <small>{vendor.serviceType} | LKR {Number(vendor.pricePerEvent).toLocaleString()}</small>
            </label>
          ))}
        </div>
        <input placeholder={`Estimated total ${booking?.estimatedTotal ? `current LKR ${booking.estimatedTotal}` : ''}`} type="number" value={estimatedTotal} onChange={(e) => setEstimatedTotal(e.target.value)} />
        <button className="primary-button" type="submit">Save Vendor Booking</button>
      </form>

      <section className="section">
        <div className="section-heading"><span>Current Data</span><h2>Events and vendors</h2></div>
        <div className="mini-list">
          {events.map((event) => <div key={event._id}><strong>{event.title}</strong><span>{event.category} | LKR {Number(event.basePrice).toLocaleString()}</span></div>)}
          {vendors.map((vendor) => <div key={vendor._id}><strong>{vendor.name}</strong><span>{vendor.serviceType} | {vendor.location}</span></div>)}
        </div>
      </section>
    </main>
  );
}
