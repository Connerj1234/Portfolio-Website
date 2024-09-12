function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open")
    icon.classList.toggle("open")
}


window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
}

function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


const contactForm = document.getElementById('contact-form'),
    contactMessage = document.getElementById('contact-message')

const sendEmail = (e) =>{
  e.preventDefault()
  emailjs.sendForm('service_3145k1q','template_07pmf12','#contact-form','Cwh2IHGKHlUtxZeSW')
    .then(() =>{
        contactMessage.textContent = 'Message sent successfully!✅'
        setTimeout(() =>{
            contactMessage.textContent = ''
        }, 5000)

        contactForm.reset()
    }, () => {
      contactMessage.textContent = 'Message not sent (service error).❌'
    })
}

contactForm.addEventListener('submit', sendEmail)

document.addEventListener("DOMContentLoaded", function() {
  const sections = document.querySelectorAll("section");
  const topNavLinks = document.querySelectorAll("#nav-links-top a");

  window.addEventListener("scroll", () => {
      let currentSection = "";

      sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          
          if (pageYOffset >= sectionTop - sectionHeight / 3) {
              currentSection = section.getAttribute("id");
          }
      });

      topNavLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href").includes(currentSection)) {
              link.classList.add("active");
          }
      });
  });
});
