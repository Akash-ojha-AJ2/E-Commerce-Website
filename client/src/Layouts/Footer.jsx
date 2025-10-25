// src/components/ProfessionalFooter.jsx
import React, { useState } from 'react'; // useState import karein
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { BsArrowRight, BsChevronDown } from 'react-icons/bs'; // BsChevronDown import karein

const Footer = () => {
    // Accordion state ke liye
    const [linksOpen, setLinksOpen] = useState(false);
    const [careOpen, setCareOpen] = useState(false);

    return (
        <footer className="professional-footer">
            
            {/* ===== 1. DESKTOP LAYOUT ===== */}
            {/* Yeh 'desktop-footer' class se desktop par dikhega aur mobile par hide ho jayega */}
            <div className="desktop-footer">
                {/* Main Footer Content */}
                <div className="footer-main footer-container">
                    
                    {/* Column 1: About & Social */}
                    <div className="footer-column footer-about">
                        <span className="footer-logo">ShopKart</span>
                        <p className="footer-description">
                            Your premier destination for quality products and exceptional service.
                        </p>
                        <div className="footer-social-icons">
                            <a href="#" aria-label="Facebook" className="social-link"><FaFacebookF /></a>
                            <a href="#" aria-label="Twitter" className="social-link"><FaTwitter /></a>
                            <a href="#" aria-label="Instagram" className="social-link"><FaInstagram /></a>
                            <a href="#" aria-label="LinkedIn" className="social-link"><FaLinkedinIn /></a>
                            <a href="#" aria-label="YouTube" className="social-link"><FaYoutube /></a>
                        </div>
                    </div>

                    {/* Column 2: Links Groups */}
                    <div className="footer-column footer-links-group">
                        <div>
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="/about"><BsArrowRight /> About Us</a></li>
                                <li><a href="/blog"><BsArrowRight /> Blog</a></li>
                                <li><a href="/careers"><BsArrowRight /> Careers</a></li>
                                <li><a href="/contact"><BsArrowRight /> Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Customer Care</h4>
                            <ul>
                                <li><a href="/faq"><BsArrowRight /> FAQ & Help</a></li>
                                <li><a href="/shipping"><BsArrowRight /> Shipping</a></li>
                                <li><a href="/returns"><BsArrowRight /> Returns</a></li>
                                <li><a href="/track-order"><BsArrowRight /> Track Order</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 3: Newsletter */}
                    <div className="footer-column footer-newsletter">
                        <h4>Subscribe to Us</h4>
                        <p>Get the latest updates on new products and upcoming sales.</p>
                        <div className="newsletter-form">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="newsletter-input"
                            />
                            <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                                <BsArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-container bottom-content">
                        <div className="copyright">
                            <p>&copy; {new Date().getFullYear()} ShopKart. All rights reserved.</p>
                            <div className="legal-links">
                                <a href="/privacy">Privacy Policy</a>
                                <a href="/terms">Terms of Service</a>
                            </div>
                        </div>
                        <div className="payment-methods">
                            <div className="payment-icon">Visa</div>
                            <div className="payment-icon">Mastercard</div>
                            <div className="payment-icon">PayPal</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 2. MOBILE-ONLY LAYOUT ===== */}
            {/* Yeh 'mobile-footer' class se sirf mobile par dikhega */}
            <div className="mobile-footer footer-container">
                
                {/* 1. Newsletter (Mobile par sabse upar) */}
                <div className="footer-column footer-newsletter">
                    <h4>Subscribe to Us</h4>
                    <div className="newsletter-form">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="newsletter-input"
                        />
                        <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                            <BsArrowRight />
                        </button>
                    </div>
                </div>

                {/* 2. Accordion Links */}
                <div className="mobile-accordion">
                    {/* Quick Links Accordion */}
                    <div className="mobile-accordion-item">
                        <button onClick={() => setLinksOpen(!linksOpen)} className="mobile-accordion-toggle">
                            <span>Quick Links</span>
                            <BsChevronDown className={`mobile-accordion-icon ${linksOpen ? 'open' : ''}`} />
                        </button>
                        {linksOpen && (
                            <div className="mobile-accordion-content">
                                <ul>
                                    <li><a href="/about"><BsArrowRight /> About Us</a></li>
                                    <li><a href="/blog"><BsArrowRight /> Blog</a></li>
                                    <li><a href="/careers"><BsArrowRight /> Careers</a></li>
                                    <li><a href="/contact"><BsArrowRight /> Contact</a></li>
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    {/* Customer Care Accordion */}
                    <div className="mobile-accordion-item">
                        <button onClick={() => setCareOpen(!careOpen)} className="mobile-accordion-toggle">
                            <span>Customer Care</span>
                            <BsChevronDown className={`mobile-accordion-icon ${careOpen ? 'open' : ''}`} />
                        </button>
                        {careOpen && (
                            <div className="mobile-accordion-content">
                                <ul>
                                    <li><a href="/faq"><BsArrowRight /> FAQ & Help</a></li>
                                    <li><a href="/shipping"><BsArrowRight /> Shipping</a></li>
                                    <li><a href="/returns"><BsArrowRight /> Returns</a></li>
                                    <li><a href="/track-order"><BsArrowRight /> Track Order</a></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Social Icons (Mobile) */}
                <div className="footer-social-icons mobile-social">
                    <a href="#" aria-label="Facebook" className="social-link"><FaFacebookF /></a>
                    <a href="#" aria-label="Twitter" className="social-link"><FaTwitter /></a>
                    <a href="#" aria-label="Instagram" className="social-link"><FaInstagram /></a>
                    <a href="#" aria-label="LinkedIn" className="social-link"><FaLinkedinIn /></a>
                    <a href="#" aria-label="YouTube" className="social-link"><FaYoutube /></a>
                </div>

                {/* 4. Footer Bottom (Mobile) */}
                <div className="footer-bottom-mobile">
                    <div className="payment-methods">
                        <div className="payment-icon">Visa</div>
                        <div className="payment-icon">Mastercard</div>
                        <div className="payment-icon">PayPal</div>
                    </div>
                    <div className="copyright">
                        <div className="legal-links">
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/terms">Terms of Service</a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} ShopKart. All rights reserved.</p>
                    </div>
                </div>

            </div>

        </footer>
    );
};

export default Footer;
