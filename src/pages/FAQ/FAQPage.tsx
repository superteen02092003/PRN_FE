import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import './FAQPage.css';

const faqCategories = [
    {
        category: 'Orders & Shipping',
        icon: 'local_shipping',
        questions: [
            {
                q: 'How long does shipping take?',
                a: 'Orders placed before 2PM are dispatched same-day. Standard delivery takes 2–4 business days. Express options are available at checkout.'
            },
            {
                q: 'Do you offer free shipping?',
                a: 'Yes! Free shipping is available on all orders over $50. Orders below this threshold have a flat shipping fee based on your location.'
            },
            {
                q: 'Can I track my order?',
                a: 'Absolutely. Once your order is shipped, you will receive a tracking number via email. You can also view your order status from the My Orders page.'
            },
            {
                q: 'Do you ship internationally?',
                a: 'Currently we ship within Vietnam only. International shipping is on our roadmap — stay tuned!'
            },
        ]
    },
    {
        category: 'Products & Stock',
        icon: 'inventory_2',
        questions: [
            {
                q: 'Are all products genuine and from official manufacturers?',
                a: 'Yes. Every component we sell is sourced directly from authorized distributors and trusted manufacturers. We do not sell counterfeit products.'
            },
            {
                q: 'What if a product is out of stock?',
                a: 'You can use the "Notify Me" feature on the product page and we will email you when it is back in stock.'
            },
            {
                q: 'Can I request a component that is not in your catalog?',
                a: 'Yes! Contact us via the chat feature or email and our team will do our best to source it for you.'
            },
        ]
    },
    {
        category: 'Returns & Warranty',
        icon: 'shield',
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We accept returns within 30 days of purchase for unused, undamaged items in original packaging. Defective products can be returned at any time within the warranty period.'
            },
            {
                q: 'How do I submit a warranty claim?',
                a: 'Log in to your account, go to My Warranties, find the order, and click "Submit Claim". Our team will review it within 1–3 business days.'
            },
            {
                q: 'How long is the warranty period?',
                a: 'Warranty periods vary by product and manufacturer — typically 6 to 12 months. The specific warranty duration is listed on each product page.'
            },
        ]
    },
    {
        category: 'Payments',
        icon: 'payments',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept VNPay, bank transfers, and major credit/debit cards. Cash on delivery (COD) is available for select locations.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes. All transactions are processed through secure, encrypted payment gateways. We do not store your card details on our servers.'
            },
            {
                q: 'Can I get a refund if my order is cancelled?',
                a: 'Yes. If you cancel before dispatch, a full refund is issued within 3–5 business days back to your original payment method.'
            },
        ]
    },
    {
        category: 'Account & Support',
        icon: 'support_agent',
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click "Sign Up" in the top right corner of the page. You can register with your email or use Google OAuth for faster sign-up.'
            },
            {
                q: 'I forgot my password. What should I do?',
                a: 'Click "Sign In" then "Forgot Password". We will send a reset link to your registered email address.'
            },
            {
                q: 'How can I contact customer support?',
                a: 'Use the live chat button on any page, or reach out via email. Our support team is available Monday–Saturday, 8AM–6PM.'
            },
        ]
    },
];

const FAQPage = () => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? faqCategories.map(cat => ({
            ...cat,
            questions: cat.questions.filter(
                q => q.q.toLowerCase().includes(search.toLowerCase()) ||
                     q.a.toLowerCase().includes(search.toLowerCase())
            )
        })).filter(cat => cat.questions.length > 0)
        : [faqCategories[activeCategory]];

    const toggleQuestion = (index: number) => {
        setOpenQuestion(prev => (prev === index ? null : index));
    };

    return (
        <>
            <Header />
            <main className="faq-page">
                {/* Hero */}
                <section className="faq-hero">
                    <h1 className="faq-hero__title">Frequently Asked Questions</h1>
                    <p className="faq-hero__subtitle">Find answers to common questions about orders, products, and more.</p>
                    <div className="faq-hero__search">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setOpenQuestion(null); }}
                        />
                        {search && (
                            <button className="faq-hero__clear" onClick={() => setSearch('')}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                </section>

                <div className="faq-body">
                    {/* Sidebar categories */}
                    {!search && (
                        <aside className="faq-sidebar">
                            {faqCategories.map((cat, i) => (
                                <button
                                    key={i}
                                    className={`faq-sidebar__item ${activeCategory === i ? 'active' : ''}`}
                                    onClick={() => { setActiveCategory(i); setOpenQuestion(null); }}
                                >
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                    {cat.category}
                                </button>
                            ))}
                        </aside>
                    )}

                    {/* Questions */}
                    <div className="faq-content">
                        {filtered.length === 0 ? (
                            <div className="faq-empty">
                                <span className="material-symbols-outlined">search_off</span>
                                <p>No results found for "<strong>{search}</strong>"</p>
                                <button onClick={() => setSearch('')}>Clear search</button>
                            </div>
                        ) : (
                            filtered.map((cat, ci) => (
                                <div key={ci} className="faq-group">
                                    {(search || filtered.length > 1) && (
                                        <div className="faq-group__header">
                                            <span className="material-symbols-outlined">{cat.icon}</span>
                                            <h2>{cat.category}</h2>
                                        </div>
                                    )}
                                    {cat.questions.map((item, qi) => {
                                        const key = ci * 100 + qi;
                                        return (
                                            <div key={qi} className={`faq-item ${openQuestion === key ? 'open' : ''}`}>
                                                <button className="faq-item__question" onClick={() => toggleQuestion(key)}>
                                                    <span>{item.q}</span>
                                                    <span className="material-symbols-outlined faq-item__arrow">
                                                        {openQuestion === key ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                </button>
                                                {openQuestion === key && (
                                                    <div className="faq-item__answer">{item.a}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* CTA */}
                <section className="faq-cta">
                    <span className="material-symbols-outlined faq-cta__icon">chat</span>
                    <h2>Still have questions?</h2>
                    <p>Our support team is ready to help you.</p>
                    <Link to="/chat" className="faq-cta__btn">
                        <span className="material-symbols-outlined">support_agent</span>
                        Chat with Us
                    </Link>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default FAQPage;
