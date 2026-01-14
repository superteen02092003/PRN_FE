import './Hero.css'

export const Hero = () => {
    return (
        <section className="hero-section">
            <div className="container-custom">
                <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <h1 className="hero-title">
                            Build Amazing
                            <span className="hero-gradient-text"> Web Applications</span>
                        </h1>

                        <p className="hero-description">
                            Modern React + Tailwind CSS setup with component-based styling.
                            Beautiful, fast, and maintainable frontend development.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="btn-primary">
                                Get Started
                            </button>
                            <button className="btn-secondary">
                                View Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 pt-8">
                            <div className="stat-item">
                                <div className="stat-value">100+</div>
                                <div className="stat-label">Components</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">50+</div>
                                <div className="stat-label">Pages</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">24/7</div>
                                <div className="stat-label">Support</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Placeholder */}
                    <div className="hero-image-wrapper">
                        <div className="hero-image-placeholder">
                            <svg className="w-full h-full text-primary-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
