document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  const copyright = document.getElementById("copyright");
  if (copyright) {
    copyright.textContent = `© ${currentYear} Conner Jamison. All Rights Reserved.`;
  }

  const sections = document.querySelectorAll(".panel[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const setActiveLink = () => {
    let current = "about";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 180;
      if (window.scrollY >= sectionTop) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  setActiveLink();
  window.addEventListener("scroll", setActiveLink);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");
const EMAILJS_SERVICE_ID = "service_3145k1q";
const EMAILJS_TEMPLATE_ID = "template_07pmf12";
const EMAILJS_PUBLIC_KEY = "Cwh2IHGKHlUtxZeSW";

if (contactForm && contactMessage) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (typeof emailjs === "undefined") {
      contactMessage.textContent = "Email service failed to load. Refresh and try again.";
      contactMessage.style.color = "#b91c1c";
      return;
    }

    const formData = {
      user_name: this.user_name.value,
      user_email: this.user_email.value,
      user_message: this.user_message.value,
      from_name: this.user_name.value,
      from_email: this.user_email.value,
      message: this.user_message.value,
      reply_to: this.user_email.value,
    };

    contactMessage.textContent = "Sending message...";
    contactMessage.style.color = "#0f766e";

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData)
      .then(() => {
        contactMessage.textContent = "Message sent successfully!";
        contactMessage.style.color = "#15803d";
        this.reset();
      })
      .catch((error) => {
        const details = error?.text || error?.message || "Unknown EmailJS error";
        contactMessage.textContent = `Failed to send: ${details}`;
        contactMessage.style.color = "#b91c1c";
        console.error("EmailJS send failed", error);
      });
  });

  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
}
