// Update copyright year
document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    const footerBottom = document.querySelector('.footer-bottom p');
    footerBottom.innerHTML = `&#169; ${currentYear} Conner Jamison. All Rights Reserved.`;
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
}

mobileMenuBtn.addEventListener('click', toggleMenu);

// Close menu when clicking a link
document.querySelectorAll('.nav-links .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (isMenuOpen) {
            toggleMenu();
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (isMenuOpen && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        toggleMenu();
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link and Back to Top Button
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-link');
const backToTopBtn = document.getElementById('back-to-top');
const navbar = document.querySelector('.navbar');

function updateActiveSection() {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    // Update navigation links
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });

    // Show/hide back to top button
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }

    // Update navbar background
    if (window.pageYOffset > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Listen for scroll events
window.addEventListener('scroll', updateActiveSection);

// Back to top functionality
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Fade In Animation for Sections
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Only add fade-in to sections after the hero
            if (entry.target.id !== 'home') {
                entry.target.classList.add('fade-in');
            }
        }
    });
}, observerOptions);

// Only observe sections after the hero
document.querySelectorAll('section:not(#home)').forEach(section => {
    observer.observe(section);
});

// Contact Form
const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-message');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form data
    const formData = {
        user_name: this.user_name.value,
        user_email: this.user_email.value,
        user_message: this.user_message.value
    };

    // Show loading message
    contactMessage.textContent = 'Sending message...';
    contactMessage.style.color = 'var(--primary-color)';

    // Send email using EmailJS
    emailjs.send('service_3145k1q', 'template_07pmf12', formData)
        .then(() => {
            contactMessage.textContent = 'Message sent successfully!';
            contactMessage.style.color = '#4CAF50';
            this.reset();
        })
        .catch((error) => {
            contactMessage.textContent = 'Failed to send message. Please try again.';
            contactMessage.style.color = '#f44336';
        });
});

// Initialize EmailJS
emailjs.init('Cwh2IHGKHlUtxZeSW');
