import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  CreditCard,
  Crown,
  Gift,
  Heart,
  MapPin,
  MessageSquarePlus,
  PartyPopper,
  Gem,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from 'lucide-react';
import api, { uploadsBaseUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const categories = [
  { label: 'Wedding', icon: Gem },
  { label: 'Birthday', icon: Gift },
  { label: 'Corporate', icon: Building2 },
  { label: 'Engagement', icon: Crown },
  { label: 'Party', icon: PartyPopper }
];

const steps = [
  ['Choose Package', 'Select your perfect event package'],
  ['Fill Details', 'Provide event details and preferences'],
  ['Confirm Booking', 'Review and confirm your booking'],
  ['Enjoy Your Event', 'We take care of the rest']
];

function getBookingStep(booking) {
  if (!booking) return 0;
  if (booking.status === 'completed') return 3;
  if (booking.paymentStatus === 'paid') return 3;
  if (booking.payments?.some((payment) => payment.status === 'verified')) return 3;
  if (booking.status === 'approved') return 2;
  if (booking.status === 'vendor_assigned') return 1;
  return 0;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wedding');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [startingPayment, setStartingPayment] = useState(false);
  const [detailsEvent, setDetailsEvent] = useState(null);
  const bookingFormRef = useRef(null);
  const eventDateRef = useRef(null);
  const [feedback, setFeedback] = useState({ bookingId: '', rating: 5, comment: '' });
  const [bookingForm, setBookingForm] = useState({
    eventService: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    guestCount: 150,
    venueAddress: '',
    notes: '',
    paymentType: 'half',
    paymentAmount: '',
    paymentNote: '',
    slip: null
  });

  const selectedEvent = useMemo(
    () => events.find((event) => event._id === bookingForm.eventService) || events[0],
    [events, bookingForm.eventService]
  );
  const filteredEvents = useMemo(
    () => events.filter((event) => event.category === selectedCategory).slice(0, 6),
    [events, selectedCategory]
  );
  const displayEvents = filteredEvents;
  const activeBooking = bookings[0];
  const activeStep = getBookingStep(activeBooking);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!filteredEvents.length) return;
    setBookingForm((current) => {
      const currentEvent = events.find((event) => event._id === current.eventService);
      if (currentEvent?.category === selectedCategory) return current;
      return { ...current, eventService: filteredEvents[0]._id };
    });
  }, [events, filteredEvents, selectedCategory]);

  async function loadData() {
    const [eventsRes, bookingsRes, feedbackRes] = await Promise.all([
      api.get('/events'),
      api.get('/bookings/mine'),
      api.get('/feedback')
    ]);
    setEvents(eventsRes.data);
    setBookings(bookingsRes.data);
    setReviews(feedbackRes.data);
    setBookingForm((current) => ({ ...current, eventService: current.eventService || eventsRes.data[0]?._id || '' }));
  }

  function loadPayHereScript() {
    if (window.payhere) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://www.payhere.lk/lib/payhere.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('PayHere checkout could not be loaded.'));
      document.body.appendChild(script);
    });
  }

  function getBookingPayload() {
    return {
      eventService: bookingForm.eventService,
      eventDate: bookingForm.eventDate,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      guestCount: bookingForm.guestCount,
      venueAddress: bookingForm.venueAddress,
      notes: bookingForm.notes
    };
  }

  function choosePackage(eventItem) {
    setBookingForm((current) => ({
      ...current,
      eventService: eventItem._id,
      venueAddress: current.venueAddress || 'Cinnamon Grand, Colombo'
    }));
    setMessage(`${eventItem.title} selected. Fill the date and confirm your booking.`);
    setError('');
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      eventDateRef.current?.focus();
    }, 80);
  }

  function bookFromDetails(eventItem) {
    setDetailsEvent(null);
    choosePackage(eventItem);
  }

  async function createBooking(event) {
    event.preventDefault();
    setSubmittingBooking(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('eventService', bookingForm.eventService);
      formData.append('eventDate', bookingForm.eventDate);
      formData.append('startTime', bookingForm.startTime);
      formData.append('endTime', bookingForm.endTime);
      formData.append('guestCount', bookingForm.guestCount);
      formData.append('venueAddress', bookingForm.venueAddress);
      formData.append('notes', bookingForm.notes);
      if (bookingForm.slip) {
        formData.append('paymentType', bookingForm.paymentType);
        formData.append('paymentAmount', bookingForm.paymentAmount || selectedEvent?.basePrice || 0);
        formData.append('paymentNote', bookingForm.paymentNote);
        formData.append('slip', bookingForm.slip);
      }

      const { data } = await api.post('/bookings', formData);
      setMessage(`Booking request for ${data.eventService?.title || 'your event'} sent. Admin can approve it from the Admin Dashboard.`);
      setBookingForm({
        eventService: events[0]?._id || '',
        eventDate: '',
        startTime: '',
        endTime: '',
        guestCount: 150,
        venueAddress: '',
        notes: '',
        paymentType: 'half',
        paymentAmount: '',
        paymentNote: '',
        slip: null
      });
      await loadData();
      setTimeout(() => document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking request failed. Please check the details and try again.');
    } finally {
      setSubmittingBooking(false);
    }
  }

  async function startPayHerePayment() {
    if (!bookingFormRef.current?.reportValidity()) return;
    setStartingPayment(true);
    setError('');
    setMessage('');

    try {
      await loadPayHereScript();
      const { data } = await api.post('/payment/create', getBookingPayload());

      window.payhere.onCompleted = async function onCompleted(orderId) {
        setMessage(`PayHere checkout completed for ${orderId}. Waiting for secure gateway verification.`);
        await loadData();
        setTimeout(() => document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      };

      window.payhere.onDismissed = function onDismissed() {
        setMessage('Payment popup closed. Your booking is saved as pending payment.');
        loadData();
      };

      window.payhere.onError = function onError(paymentError) {
        setError(`PayHere payment failed to start: ${paymentError}`);
        loadData();
      };

      window.payhere.startPayment(data.payment);
      setMessage(`Secure payment started for ${data.booking.eventService?.title || 'your event'}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not start PayHere payment.');
    } finally {
      setStartingPayment(false);
    }
  }

  async function submitFeedback(event) {
    event.preventDefault();
    await api.post('/feedback', feedback);
    setMessage('Thank you. Your event feedback was published.');
    setFeedback({ bookingId: '', rating: 5, comment: '' });
    loadData();
  }

  return (
    <main className="customer-portal">
      <section className="customer-hero">
        <div className="customer-hero-copy">
          <h1>Plan Your <span>Perfect Event</span></h1>
          <p>Browse packages, compare options, and book your dream event in minutes.</p>
          <div className="customer-hero-actions">
            <a className="purple-cta" href="#packages">View Packages <ChevronRight size={18} /></a>
            <a className="white-cta" href="#bookings">My Bookings <CalendarDays size={18} /></a>
          </div>
        </div>
      </section>

      {message && <div className="customer-toast">{message}</div>}
      {error && <div className="customer-toast error">{error}</div>}

      <section className="customer-shell">
        <div className="category-strip">
          {categories.map(({ label, icon: Icon }) => (
            <button
              className={selectedCategory === label ? 'active' : ''}
              key={label}
              onClick={() => setSelectedCategory(label)}
              type="button"
            >
              <Icon size={36} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="booking-layout">
          <div className="package-area" id="packages">
            <div className="portal-section-title">
              <h2>Featured Packages <Sparkles size={17} /></h2>
              <button type="button">View All Packages <ChevronRight size={17} /></button>
            </div>

            <div className="customer-package-grid">
              {displayEvents.slice(0, 3).map((eventItem) => (
                <article className="customer-package-card" key={eventItem._id}>
                  <div className="package-image">
                    <img src={eventItem.coverImage} alt={eventItem.title} />
                    <button type="button" title="Save package"><Heart size={20} /></button>
                  </div>
                  <div className="package-body">
                    <h3>{eventItem.title}</h3>
                    <div className="package-meta">
                      <span><Star size={15} /> 4.9</span>
                      <span><Users size={15} /> Up to {eventItem.category === 'Wedding' ? 300 : 150} Guests</span>
                    </div>
                    <span className="location"><MapPin size={15} /> Colombo</span>
                    <strong>Rs. {Number(eventItem.basePrice).toLocaleString()}</strong>
                    <div className="package-actions">
                      <button type="button" onClick={() => setDetailsEvent(eventItem)}>View Details</button>
                      <button type="button" onClick={() => choosePackage(eventItem)}>Book Now</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {displayEvents.length === 0 && (
              <div className="empty-package-state">
                <Sparkles size={28} />
                <h3>No {selectedCategory} packages yet</h3>
                <p>Admin can add a {selectedCategory.toLowerCase()} event package from the Admin Dashboard.</p>
              </div>
            )}

            <div className="how-it-works">
              <h2>How It Works <Sparkles size={17} /></h2>
              <div>
                {steps.map(([title, copy], index) => (
                  <article key={title}>
                    <span>{index + 1}</span>
                    <strong>Step {index + 1}: {title}</strong>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <form className="booking-card" id="booking-form" ref={bookingFormRef} onSubmit={createBooking}>
            <div className="form-title">
              <h2>Book Package</h2>
              <Bell size={19} />
            </div>
            {selectedEvent && (
              <div className="selected-package">
                <img src={selectedEvent.coverImage} alt={selectedEvent.title} />
                <div>
                  <strong>{selectedEvent.title}</strong>
                  <span>Rs. {Number(selectedEvent.basePrice).toLocaleString()}</span>
                </div>
              </div>
            )}
            <label>Package</label>
            <select value={bookingForm.eventService} onChange={(e) => setBookingForm({ ...bookingForm, eventService: e.target.value })} required>
              {events.map((eventItem) => <option key={eventItem._id} value={eventItem._id}>{eventItem.title}</option>)}
            </select>
            <div className="include-grid">
              {(selectedEvent?.inclusions?.length ? selectedEvent.inclusions : ['Venue', 'Catering', 'Photography', 'Decorations']).slice(0, 6).map((item) => (
                <span key={item}><CheckCircle2 size={15} /> {item}</span>
              ))}
            </div>
            <label>Event Date</label>
            <input ref={eventDateRef} type="date" value={bookingForm.eventDate} onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })} required />
            <div className="time-field-row">
              <div>
                <label>Start Time</label>
                <input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} required />
              </div>
              <div>
                <label>End Time</label>
                <input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} required />
              </div>
            </div>
            <label>Guest Count</label>
            <input type="number" min="1" value={bookingForm.guestCount} onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })} required />
            <label>Venue Address</label>
            <input value={bookingForm.venueAddress} onChange={(e) => setBookingForm({ ...bookingForm, venueAddress: e.target.value })} placeholder="Cinnamon Grand, Colombo" required />
            <label>Special Notes</label>
            <textarea value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} placeholder="Any special requests..." />
            <div className="booking-total">
              <span>Total Amount</span>
              <strong>Rs. {Number(selectedEvent?.basePrice || 0).toLocaleString()}</strong>
            </div>
            <div className="booking-payment-box">
              <h3>Upload Payment Slip</h3>
              <p>Optional: upload half or full bank payment slip with this booking request.</p>
              <div className="booking-payment-row">
                <select value={bookingForm.paymentType} onChange={(e) => setBookingForm({ ...bookingForm, paymentType: e.target.value })}>
                  <option value="half">Half Payment</option>
                  <option value="full">Full Payment</option>
                </select>
                <input
                  min="1"
                  placeholder="Amount"
                  type="number"
                  value={bookingForm.paymentAmount}
                  onChange={(e) => setBookingForm({ ...bookingForm, paymentAmount: e.target.value })}
                />
              </div>
              <label className="booking-slip-upload">
                <CloudUpload size={24} />
                <span>{bookingForm.slip ? bookingForm.slip.name : 'Choose payment slip photo'}</span>
                <input accept="image/*" type="file" onChange={(e) => setBookingForm({ ...bookingForm, slip: e.target.files[0] })} />
              </label>
              <input
                placeholder="Payment note optional"
                value={bookingForm.paymentNote}
                onChange={(e) => setBookingForm({ ...bookingForm, paymentNote: e.target.value })}
              />
            </div>
            <button className="gold-cta" disabled={submittingBooking} type="submit">
              {submittingBooking ? 'Sending Request...' : 'Confirm Booking'} <ShieldCheck size={18} />
            </button>
            <button className="payhere-cta" disabled={startingPayment || submittingBooking} onClick={startPayHerePayment} type="button">
              {startingPayment ? 'Starting PayHere...' : 'Pay Now with PayHere'} <CreditCard size={18} />
            </button>
          </form>
        </div>
      </section>

      <section className="customer-lower-grid" id="bookings">
        <div className="status-card">
          <h2>Booking Status</h2>
          <div className="status-track">
            {['Pending Approval', 'Approved', 'Payment Completed', 'Event Confirmed'].map((item, index) => (
              <span key={item} className={index <= activeStep ? 'done' : ''}>{item}</span>
            ))}
          </div>
          {activeBooking ? (
            <article className="active-booking">
              <img src={activeBooking.eventService?.coverImage} alt={activeBooking.eventService?.title} />
              <div>
                <h3>{activeBooking.eventService?.title}</h3>
                <p><MapPin size={15} /> {activeBooking.venueAddress}</p>
                <p><CalendarDays size={15} /> {new Date(activeBooking.eventDate).toLocaleDateString()} | {activeBooking.startTime || '--:--'} - {activeBooking.endTime || '--:--'} | {activeBooking.guestCount} Guests</p>
              </div>
              <div>
                <strong>Rs. {Number(activeBooking.estimatedTotal).toLocaleString()}</strong>
                <StatusBadge status={activeBooking.status} />
                <StatusBadge status={activeBooking.paymentStatus || 'pending'} />
              </div>
            </article>
          ) : (
            <p className="muted">Your active booking will appear here after you send a request.</p>
          )}
        </div>
      </section>

      <section className="reviews-panel">
        <div className="portal-section-title">
          <h2>What Our Customers Say <Sparkles size={17} /></h2>
          <button type="button">View All Reviews <ChevronRight size={17} /></button>
        </div>
        <div className="review-grid">
          {reviews.slice(0, 3).map((review) => (
            <article key={review._id}>
              <div className="stars">{'★'.repeat(review.rating)}</div>
              <p>{review.comment}</p>
              <strong>{review.customer?.name}</strong>
            </article>
          ))}
        </div>
        <form className="quick-feedback" onSubmit={submitFeedback}>
          <h3><MessageSquarePlus size={18} /> Add Your Feedback</h3>
          <select value={feedback.bookingId} onChange={(e) => setFeedback({ ...feedback, bookingId: e.target.value })} required>
            <option value="">Select booking</option>
            {bookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.eventService?.title}</option>)}
          </select>
          <input type="number" min="1" max="5" value={feedback.rating} onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })} />
          <input value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} placeholder="Write feedback..." required />
          <button className="purple-cta" type="submit">Publish</button>
        </form>
      </section>

      <section className="customer-history">
        <h2>My Booking History</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Event</th><th>Date & Time</th><th>Status</th><th>Total</th><th>Payments</th><th>Vendors</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.eventService?.title}</td>
                  <td>{new Date(booking.eventDate).toLocaleDateString()}<small>{booking.startTime || '--:--'} - {booking.endTime || '--:--'}</small></td>
                  <td><StatusBadge status={booking.status} /></td>
                  <td>LKR {Number(booking.estimatedTotal).toLocaleString()}</td>
                  <td>
                    {booking.paymentGateway === 'payhere' && <span>PayHere: {booking.paymentStatus}</span>}
                    {booking.payments?.map((pay) =>
                      pay.slipUrl ? (
                        <a key={pay._id} href={`${uploadsBaseUrl}${pay.slipUrl}`} target="_blank">Slip</a>
                      ) : (
                        <span key={pay._id}>{pay.note || 'Online payment'}</span>
                      )
                    ) || 'No payment'}
                  </td>
                  <td>{booking.assignedVendors?.map((vendor) => vendor.name).join(', ') || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detailsEvent && (
        <div className="details-modal-backdrop" onClick={() => setDetailsEvent(null)}>
          <article className="details-modal" onClick={(event) => event.stopPropagation()}>
            <button className="details-close" onClick={() => setDetailsEvent(null)} type="button">x</button>
            <img src={detailsEvent.coverImage} alt={detailsEvent.title} />
            <div className="details-modal-body">
              <span>{detailsEvent.category}</span>
              <h2>{detailsEvent.title}</h2>
              <p>{detailsEvent.description}</p>
              <div className="details-meta-grid">
                <div><Star size={18} /><strong>4.9 Rating</strong><small>Trusted customer feedback</small></div>
                <div><Users size={18} /><strong>Up to {detailsEvent.category === 'Wedding' ? 300 : 150} Guests</strong><small>Flexible event scale</small></div>
                <div><MapPin size={18} /><strong>Colombo</strong><small>Location can be customized</small></div>
              </div>
              <h3>Package Includes</h3>
              <div className="details-inclusions">
                {(detailsEvent.inclusions?.length ? detailsEvent.inclusions : ['Venue', 'Catering', 'Photography', 'Decorations']).map((item) => (
                  <span key={item}><CheckCircle2 size={16} /> {item}</span>
                ))}
              </div>
              <div className="details-footer">
                <strong>Rs. {Number(detailsEvent.basePrice).toLocaleString()}</strong>
                <button className="purple-cta" onClick={() => bookFromDetails(detailsEvent)} type="button">
                  Book This Package <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
