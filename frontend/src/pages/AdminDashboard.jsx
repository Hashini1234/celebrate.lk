import React from 'react';
import {
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  Eye,
  Home,
  Link as LinkIcon,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Star,
  Store,
  UserCog,
  Users,
  XCircle
} from 'lucide-react';
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
  const [applications, setApplications] = useState([]);
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
    const [eventsRes, vendorsRes, bookingsRes, applicationsRes] = await Promise.all([
      api.get('/events'),
      api.get('/vendors'),
      api.get('/bookings'),
      api.get('/vendor-applications')
    ]);
    setEvents(eventsRes.data);
    setVendors(vendorsRes.data);
    setBookings(bookingsRes.data);
    setApplications(applicationsRes.data);
  }

  async function addEvent(event) {
    event.preventDefault();
    try {
      await api.post('/events', {
        ...eventForm,
        basePrice: Number(eventForm.basePrice),
        inclusions: eventForm.inclusions.split(',').map((item) => item.trim()).filter(Boolean)
      });
      setMessage('Event package added.');
      setEventForm(emptyEvent);
      loadData();
    } catch (err) {
      setMessage(err.response?.status === 403 ? 'Only an admin account can add events. Please logout and login as admin.' : err.response?.data?.message || 'Could not add event.');
    }
  }

  async function addVendor(event) {
    event.preventDefault();
    try {
      await api.post('/vendors', { ...vendorForm, pricePerEvent: Number(vendorForm.pricePerEvent) });
      setMessage('Vendor added.');
      setVendorForm(emptyVendor);
      loadData();
    } catch (err) {
      setMessage(err.response?.status === 403 ? 'Only an admin account can add vendors. Please logout and login as admin.' : err.response?.data?.message || 'Could not add vendor.');
    }
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

  async function updateApplication(id, status) {
    await api.patch(`/vendor-applications/${id}/status`, { status });
    setMessage(`Vendor application ${status}.`);
    loadData();
  }

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <div className="admin-side-brand">
          <strong>Celebrate.lk</strong>
          <span>Plan. Celebrate. Cherish.</span>
        </div>
        <nav>
          <a className="active" href="#dashboard"><Home size={18} /> Dashboard</a>
          <small>Main</small>
          <a href="#requests"><CalendarDays size={18} /> Booking Requests</a>
          <a href="#events"><CalendarCheck size={18} /> Events</a>
          <a href="#vendors"><Store size={18} /> Vendors</a>
          <a href="#customers"><Users size={18} /> Customers</a>
          <small>Management</small>
          <a href="#packages"><Package size={18} /> Packages</a>
          <a href="#payments"><CreditCard size={18} /> Payments</a>
          <a href="#reviews"><Star size={18} /> Reviews</a>
          <a href="#reports"><BarChart3 size={18} /> Reports</a>
          <a href="#settings"><Settings size={18} /> Settings</a>
          <a href="#users"><UserCog size={18} /> User Management</a>
        </nav>
        <div className="admin-premium-card">
          <Crown size={36} />
          <strong>Upgrade to Premium</strong>
          <p>Unlock advanced features and grow your business.</p>
          <button type="button">Upgrade Now</button>
        </div>
      </aside>

      <section className="admin-main" id="dashboard">
        <header className="admin-topbar">
          <button className="admin-menu-button" type="button"><Menu size={24} /></button>
          <label className="admin-search"><Search size={20} /><input placeholder="Search anything..." /></label>
          <div className="admin-top-user">
            <Bell size={21} />
            <span>{pendingBookings.length}</span>
            <div className="admin-avatar">A</div>
            <div><strong>{user.name}</strong><small>Super Admin</small></div>
          </div>
        </header>

        {message && <div className="success-box">{message}</div>}

        <section className="admin-welcome">
          <div>
            <span>Admin Panel</span>
            <h1>Welcome back, {user.name}! <span>👋</span></h1>
            <p>Here's what's happening with your business today.</p>
          </div>
          <div className="admin-welcome-art"><CalendarDays size={72} /><SparklesFallback /></div>
        </section>

        <div className="admin-stat-grid">
          <article><CalendarCheck /><strong>{bookings.length}</strong><span>Total Bookings</span><small>↑ 18% from last month</small></article>
          <article><Users /><strong>{vendors.length}</strong><span>Active Vendors</span><small>↑ 12% from last month</small></article>
          <article><CheckCircle2 /><strong>{bookings.filter((item) => item.status === 'approved').length}</strong><span>Approved Requests</span><small>↑ 20% from last month</small></article>
          <article><CalendarCheck /><strong>{bookings.filter((item) => item.status === 'completed').length}</strong><span>Completed Events</span><small>↑ 15% from last month</small></article>
        </div>

        <div className="admin-two-col">
          <section className="admin-card" id="requests">
            <div className="admin-card-title"><h2><Users size={20} /> New Booking Requests</h2><button type="button">View All</button></div>
            {pendingBookings[0] ? (
              <article className="admin-feature-request">
                <img src={pendingBookings[0].eventService?.coverImage} alt={pendingBookings[0].eventService?.title} />
                <div>
                  <strong>{pendingBookings[0].eventService?.title}</strong>
                  <span>by {pendingBookings[0].customer?.name}</span>
                  <small>{pendingBookings[0].venueAddress} | {new Date(pendingBookings[0].eventDate).toLocaleDateString()}</small>
                </div>
                <StatusBadge status={pendingBookings[0].status} />
                <button onClick={() => updateStatus(pendingBookings[0]._id, 'approved')} type="button">Review Request</button>
              </article>
            ) : <p className="muted">No pending customer booking requests right now.</p>}
          </section>

          <section className="admin-card">
            <div className="admin-card-title"><h2><UserCog size={20} /> Quick Actions</h2></div>
            <div className="admin-quick-actions">
              <a href="#events"><Plus /> Add Event</a>
              <a href="#vendors"><Plus /> Add Vendor</a>
              <a href="#assign"><LinkIcon /> Assign Vendor</a>
              <a href="#reports"><BarChart3 /> View Reports</a>
            </div>
          </section>
        </div>

        <section className="admin-card" id="bookings">
          <div className="admin-card-title"><h2><CalendarDays size={20} /> Recent Booking Requests</h2><button type="button">View All Requests →</button></div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr><th>Customer</th><th>Event</th><th>Date</th><th>Venue</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map((item) => (
                  <tr key={item._id}>
                    <td><span className="admin-customer-dot">{item.customer?.name?.[0] || 'C'}</span>{item.customer?.name}<small>{item.customer?.email}</small></td>
                    <td>{item.eventService?.title}</td>
                    <td>{new Date(item.eventDate).toLocaleDateString()}<small>{item.startTime || '--:--'} - {item.endTime || '--:--'}</small></td>
                    <td>{item.venueAddress}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.payments?.length ? item.payments.map((pay) => <a key={pay._id} href={`${uploadsBaseUrl}${pay.slipUrl}`} target="_blank">LKR {Number(pay.amount).toLocaleString()}</a>) : 'No slip'}</td>
                    <td className="admin-action-cell">
                      <button type="button"><Eye size={15} /> View</button>
                      <button onClick={() => updateStatus(item._id, 'approved')} disabled={item.status === 'approved'} type="button">Approve</button>
                      <button disabled={!item.payments?.length || item.status === 'completed'} onClick={() => verifyPayment(item._id)} type="button">Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="admin-two-col admin-forms-row">
          <form className="admin-card admin-form-card" id="events" onSubmit={addEvent}>
            <h2><Plus size={20} /> Add Event</h2>
            <input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
            <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
              {['Wedding', 'Birthday', 'Engagement', 'Corporate', 'Festival', 'Meeting', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input placeholder="Base price" type="number" value={eventForm.basePrice} onChange={(e) => setEventForm({ ...eventForm, basePrice: e.target.value })} required />
            <input placeholder="Cover image URL" value={eventForm.coverImage} onChange={(e) => setEventForm({ ...eventForm, coverImage: e.target.value })} required />
            <textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
            <input placeholder="Inclusions comma separated" value={eventForm.inclusions} onChange={(e) => setEventForm({ ...eventForm, inclusions: e.target.value })} />
            <button type="submit">Add Event</button>
          </form>

          <form className="admin-card admin-form-card" id="vendors" onSubmit={addVendor}>
            <h2><Store size={20} /> Add Vendor</h2>
            <input placeholder="Vendor name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} required />
            <select value={vendorForm.serviceType} onChange={(e) => setVendorForm({ ...vendorForm, serviceType: e.target.value })}>
              {['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input placeholder="Email" type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} required />
            <input placeholder="Phone" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} required />
            <input placeholder="Location" value={vendorForm.location} onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })} required />
            <input placeholder="Price per event" type="number" value={vendorForm.pricePerEvent} onChange={(e) => setVendorForm({ ...vendorForm, pricePerEvent: e.target.value })} />
            <button type="submit">Add Vendor</button>
          </form>
        </div>

        <section className="admin-card" id="applications">
          <div className="admin-card-title"><h2><Store size={20} /> Vendor Applications</h2></div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Business</th><th>Owner</th><th>Category</th><th>District</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td>{application.businessName}<small>{application.email}</small></td>
                    <td>{application.ownerName}<small>{application.phone}</small></td>
                    <td>{application.vendorCategory}</td>
                    <td>{application.district}</td>
                    <td><StatusBadge status={application.status} /></td>
                    <td className="admin-action-cell">
                      <button disabled={application.status === 'approved'} onClick={() => updateApplication(application._id, 'approved')} type="button">Approve</button>
                      <button disabled={application.status === 'rejected'} onClick={() => updateApplication(application._id, 'rejected')} type="button">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <form className="admin-card admin-form-card" id="assign" onSubmit={assignVendors}>
          <h2><LinkIcon size={20} /> Assign Free Vendors</h2>
          <select value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)} required>
            <option value="">Select booking</option>
            {bookings.map((item) => <option key={item._id} value={item._id}>{item.customer?.name} - {item.eventService?.title}</option>)}
          </select>
          <button type="button" onClick={() => checkFreeVendors()}>Check free vendors for date</button>
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
          <button type="submit">Save Vendor Booking</button>
        </form>

        <div className="admin-bottom-grid">
          <section className="admin-card" id="reports">
            <div className="admin-card-title"><h2><Store size={20} /> Top Vendors</h2><button type="button">View All</button></div>
            <div className="admin-vendor-list">
              {vendors.slice(0, 3).map((vendor, index) => (
                <article key={vendor._id}>
                  <span>{index + 1}</span>
                  <div><strong>{vendor.name}</strong><small>Rating {vendor.rating || 4.8}/5 ({vendor.serviceType})</small></div>
                  <em>{Math.max(5, bookings.filter((item) => item.assignedVendors?.some((assigned) => assigned._id === vendor._id)).length)} Events</em>
                </article>
              ))}
            </div>
          </section>
          <section className="admin-card"><div className="admin-card-title"><h2><CreditCard size={20} /> Revenue Overview</h2></div><strong className="admin-big-number">LKR {bookings.reduce((sum, item) => sum + Number(item.estimatedTotal || 0), 0).toLocaleString()}</strong><p className="muted">Up 12.5% from last month</p></section>
          <section className="admin-card"><div className="admin-card-title"><h2><BarChart3 size={20} /> Booking Statistics</h2></div><div className="admin-donut"><strong>{bookings.length}</strong><span>Total</span></div></section>
          <section className="admin-card"><div className="admin-card-title"><h2><Bell size={20} /> Recent Activity</h2><button type="button">View All</button></div><ul className="admin-activity"><li>New booking request received</li><li>Booking approved by admin</li><li>Payment slip uploaded</li><li>Vendor application reviewed</li></ul></section>
        </div>
      </section>
      </main>
  );
}

function SparklesFallback() {
  return <span className="admin-sparkle-dots" aria-hidden="true" />;
}
