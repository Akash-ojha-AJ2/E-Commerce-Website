// src/components/Footer.jsx

import React from 'react';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { BsShieldCheck, BsTruck, BsHeadset } from 'react-icons/bs';

// Payment Icons
import visa from '../assets/visa.png';
import mastercard from '../assets/mastercard.png';
import upi from '../assets/UPI.png';
import razorpay from '../assets/rozarpay.png';

const Footer = () => {
    return (
        <footer className="footer-site">
            {/* Removed the pre-footer section with features to make it more compact */}

            <div className="footer-main footer-container">
                <div className="footer-column footer-about-us">
                    <h3 className="footer-logo">ShopKart</h3>
                    <p>Your one-stop shop for everything you need. Quality products with the best service.</p>
                    
                    <div className="footer-social-icons">
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="Twitter"><FaTwitter /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                        <a href="#" aria-label="YouTube"><FaYoutube /></a>
                    </div>
                </div>

                <div className="footer-column">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/careers">Careers</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Customer Care</h4>
                    <ul>
                        <li><a href="/faq">FAQ & Help</a></li>
                        <li><a href="/shipping">Shipping</a></li>
                        <li><a href="/returns">Returns</a></li>
                        <li><a href="/track-order">Track Order</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Newsletter</h4>
                    <p>Subscribe for updates</p>
                    <div className="footer-newsletter-form">
                        <input type="email" placeholder="Your email" />
                        <button type="submit">Subscribe</button>
                    </div>
                </div>
            </div>

            <div className="footer-sub">
                <div className="footer-container footer-sub-content">
                    <p>&copy; {new Date().getFullYear()} ShopKart.com</p>
                    <div className="footer-payment-icons">
                        <span>We Accept:</span>
                        <img src={visa} alt="Visa" />
                        <img src={mastercard} alt="Mastercard" />
                        <img src={upi} alt="UPI" />
                        <img src={razorpay} alt="Razorpay" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;