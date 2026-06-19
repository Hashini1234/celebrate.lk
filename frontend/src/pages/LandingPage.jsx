import React from 'react';
import { ArrowRight, BadgeCheck, CalendarCheck, CreditCard, Headphones, ShieldCheck, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client';

const fallbackEvents = [];

export default function LandingPage() {
  const [events, setEvents] = useState(fallbackEvents);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api.get('/events').then(({ data }) => setEvents(data)).catch(() => setEvents([]));
    api.get('/feedback').then(({ data }) => setFeedback(data)).catch(() => setFeedback([]));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="trust-row">
            <span><ShieldCheck size={18} /> Trusted Vendors</span>
            <span>AI Planning</span>
            <span>Secure Payments</span>
          </div>
          <h1>Celebrate Every Moment</h1>
          <p>Plan weddings, engagements, birthdays, corporate events and more with verified vendors, smart booking tools and payment tracking in one place.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/login"><ArrowRight size={18} /> View Platform</Link>
            <a className="ghost-button" href="#services">Explore Services</a>
          </div>
          <div className="stats-panel">
            <div><Users /><strong>1000+</strong><span>Happy Customers</span></div>
            <div><BadgeCheck /><strong>500+</strong><span>Verified Vendors</span></div>
            <div><Star /><strong>4.9/5</strong><span>Customer Rating</span></div>
            <div><Headphones /><strong>24/7</strong><span>Live Support</span></div>
            <div><CalendarCheck /><strong>5000+</strong><span>Events Managed</span></div>
            <div><CreditCard /><strong>100%</strong><span>Secure Payments</span></div>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <div className="section-heading">
          <span>Services</span>
          <h2>Event packages customers can book online</h2>
        </div>
        <div className="service-grid">
          {events.map((event) => (
            <article className="service-card" key={event._id}>
              <img src={event.coverImage} alt={event.title} />
              <div>
                <span>{event.category}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <strong>LKR {Number(event.basePrice).toLocaleString()}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <img src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80" alt="Event planning team" />
        <div>
          <span>About us</span>
          <h2>One platform for customers, admins and vendors</h2>
          <p>Celebrate.lk keeps customer booking requests, vendor availability, approval notifications and bank slip payment records organized in a single MERN stack system.</p>
          <div className="process-row">
            <span>Book</span>
            <span>Assign</span>
            <span>Approve</span>
            <span>Pay</span>
          </div>
        </div>
      </section>

      <section id="feedback" className="section tinted">
        <div className="section-heading">
          <span>Testimonials</span>
          <h2>Customers can view feedback from past events</h2>
        </div>
        <div className="feedback-grid">
          {feedback.length === 0 && <p className="muted">Feedback will appear here after customers add reviews.</p>}
          {feedback.map((item) => (
            <article className="feedback-card" key={item._id}>
              <div className="stars">{'★'.repeat(item.rating)}</div>
              <p>{item.comment}</p>
              <strong>{item.customer?.name}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
