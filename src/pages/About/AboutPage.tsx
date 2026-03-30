import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import './AboutPage.css';

const values = [
    { icon: 'verified', title: 'Quality First', desc: 'Every component we sell is sourced from trusted manufacturers and tested for reliability.' },
    { icon: 'handshake', title: 'Customer Trust', desc: 'We build long-term relationships with our customers through transparency and honest service.' },
    { icon: 'rocket_launch', title: 'Innovation', desc: 'We stay ahead of the curve, constantly updating our catalog with the latest STEM components.' },
    { icon: 'groups', title: 'Community', desc: 'We believe in empowering makers, students, and engineers to bring their ideas to life.' },
];

const teamRoles = [
    {
        role: 'Backend Engineers',
        desc: 'Architecting the systems that power our platform — APIs, databases, and business logic.',
        img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format',
    },
    {
        role: 'Frontend Developers',
        desc: 'Crafting smooth, intuitive interfaces so every maker finds what they need effortlessly.',
        img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=400&fit=crop&auto=format',
    },
    {
        role: 'Hardware Specialists',
        desc: 'Hands-on experts who verify every component for quality before it reaches your door.',
        img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&auto=format',
    },
    {
        role: 'Support & Logistics',
        desc: 'Ensuring your orders arrive fast and your questions are answered by real engineers.',
        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=400&fit=crop&auto=format',
    },
];

const AboutPage = () => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); }),
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        document.querySelectorAll('.about-animate').forEach(el => observerRef.current?.observe(el));
        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <>
            <Header />
            <main className="about-page">

                {/* ===== HERO ===== */}
                <section className="about-hero">
                    <div className="about-hero__bg">
                        <img
                            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&auto=format"
                            alt="Electronics lab"
                        />
                        <div className="about-hero__overlay" />
                    </div>
                    <div className="about-hero__content about-animate">
                        <span className="about-hero__eyebrow">Who We Are</span>
                        <h1 className="about-hero__title">Built for Makers,<br />by Makers</h1>
                        <p className="about-hero__subtitle">
                            STEM Gear is a one-stop shop for engineers, students, and hobbyists looking for
                            industrial-grade components to power their next big idea.
                        </p>
                        <div className="about-hero__actions">
                            <Link to="/products" className="about-btn about-btn--primary">
                                <span className="material-symbols-outlined">storefront</span>
                                Browse Products
                            </Link>
                            <Link to="/faq" className="about-btn about-btn--ghost">
                                <span className="material-symbols-outlined">help</span>
                                View FAQ
                            </Link>
                        </div>
                    </div>
                    <div className="about-hero__scroll-hint">
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </div>
                </section>

                {/* ===== STATS ===== */}
                <section className="about-stats">
                    {[
                        { icon: 'inventory_2', value: '500+', label: 'Products' },
                        { icon: 'verified', value: '30+', label: 'Trusted Brands' },
                        { icon: 'group', value: '10,000+', label: 'Happy Customers' },
                        { icon: 'star', value: '4.8★', label: 'Average Rating' },
                    ].map((s, i) => (
                        <div key={i} className="about-stat about-animate" style={{ animationDelay: `${i * 0.1}s` }}>
                            <span className="material-symbols-outlined about-stat__icon">{s.icon}</span>
                            <span className="about-stat__value">{s.value}</span>
                            <span className="about-stat__label">{s.label}</span>
                        </div>
                    ))}
                </section>

                {/* ===== MISSION ===== */}
                <section className="about-mission">
                    <div className="about-mission__image about-animate">
                        <img
                            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&h=520&fit=crop&auto=format"
                            alt="STEM components"
                        />
                        <div className="about-mission__image-badge">
                            <span className="material-symbols-outlined">verified</span>
                            Quality Guaranteed
                        </div>
                    </div>
                    <div className="about-mission__text about-animate">
                        <span className="about-eyebrow">Our Mission</span>
                        <h2>Great ideas shouldn't be held back by hard-to-find parts</h2>
                        <p>
                            At STEM Gear, we make high-quality STEM components accessible, affordable, and
                            delivered fast — so you can focus on what matters: building.
                        </p>
                        <p>
                            From ESP32 microcontrollers to stepper motors and sensor kits, we stock everything
                            you need for IoT, robotics, automation, and beyond. Every product in our catalog
                            is backed by manufacturer warranty and our own quality guarantee.
                        </p>
                        <div className="about-mission__features">
                            {['Same-day dispatch before 2PM', 'Manufacturer warranty on all items', '30-day hassle-free returns'].map((f, i) => (
                                <div key={i} className="about-mission__feature">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== REAL PHOTO BANNER ===== */}
                <section className="about-banner">
                    <img
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&h=500&fit=crop&auto=format"
                        alt="Engineer working"
                    />
                    <div className="about-banner__overlay">
                        <h2 className="about-animate">Powering the next generation of makers</h2>
                        <p className="about-animate">From student projects to professional prototypes</p>
                    </div>
                </section>

                {/* ===== VALUES ===== */}
                <section className="about-values">
                    <div className="about-values__header about-animate">
                        <span className="about-eyebrow">What We Stand For</span>
                        <h2>Our Core Values</h2>
                    </div>
                    <div className="about-values__grid">
                        {values.map((v, i) => (
                            <div key={i} className="about-value-card about-animate" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="about-value-card__icon">
                                    <span className="material-symbols-outlined">{v.icon}</span>
                                </div>
                                <h3>{v.title}</h3>
                                <p>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== TEAM ===== */}
                <section className="about-team">
                    <div className="about-team__header about-animate">
                        <span className="about-eyebrow">The People Behind STEM Gear</span>
                        <h2>Our Team</h2>
                        <p>A passionate group of engineers, makers, and problem-solvers dedicated to helping you build better.</p>
                    </div>
                    <div className="about-team__grid">
                        {teamRoles.map((member, i) => (
                            <div key={i} className="about-team-card about-animate" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="about-team-card__img">
                                    <img src={member.img} alt={member.role} />
                                    <div className="about-team-card__img-overlay" />
                                </div>
                                <div className="about-team-card__body">
                                    <h3>{member.role}</h3>
                                    <p>{member.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Group photo */}
                    <div className="about-team__group about-animate">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=500&fit=crop&auto=format"
                            alt="STEM Gear team"
                        />
                        <div className="about-team__group-caption">
                            <span className="material-symbols-outlined">favorite</span>
                            The team that makes STEM Gear possible
                        </div>
                    </div>
                </section>

                {/* ===== CTA ===== */}
                <section className="about-cta">
                    <div className="about-cta__bg">
                        <img
                            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&h=600&fit=crop&auto=format"
                            alt="Robot"
                        />
                        <div className="about-cta__overlay" />
                    </div>
                    <div className="about-cta__content about-animate">
                        <h2>Ready to Start Building?</h2>
                        <p>Explore our full catalog of STEM components and find everything you need.</p>
                        <Link to="/products" className="about-btn about-btn--primary">
                            <span className="material-symbols-outlined">storefront</span>
                            Shop Now
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
};

export default AboutPage;
