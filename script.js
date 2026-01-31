// --- Buscador inteligente de lenguajes ---

const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    cards.forEach((card) => {
      const language = card.dataset.language || "";
      const title = card.querySelector("h3")?.textContent.toLowerCase() || "";

      const matchesLanguage = language.includes(query);
      const matchesTitle = title.includes(query);

      if (!query || matchesLanguage || matchesTitle) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// --- Validación del Buzón de sugerencias ---

const suggestionForm = document.getElementById("suggestionForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const suggestionInput = document.getElementById("suggestion");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const suggestionError = document.getElementById("suggestionError");
const formFeedback = document.getElementById("formFeedback");

function validateEmail(email) {
  // Validación sencilla de email
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function clearErrors() {
  nameError.textContent = "";
  emailError.textContent = "";
  suggestionError.textContent = "";
  formFeedback.textContent = "";
  formFeedback.classList.remove("success", "error");
}

if (suggestionForm) {
  suggestionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    let isValid = true;

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const suggestionValue = suggestionInput.value.trim();

    if (!nameValue) {
      nameError.textContent = "Por favor, introduce tu nombre.";
      isValid = false;
    }

    if (!emailValue) {
      emailError.textContent = "El correo electrónico es obligatorio.";
      isValid = false;
    } else if (!validateEmail(emailValue)) {
      emailError.textContent = "Introduce un correo electrónico válido.";
      isValid = false;
    }

    if (!suggestionValue) {
      suggestionError.textContent = "Cuéntanos tu sugerencia o comentario.";
      isValid = false;
    }

    if (!isValid) {
      formFeedback.textContent = "Revisa los campos marcados en rojo.";
      formFeedback.classList.add("error");
      return;
    }

    // Simulación de envío correcto
    formFeedback.textContent = "¡Gracias! Tu sugerencia se ha enviado correctamente.";
    formFeedback.classList.add("success");

    // Reset visual suave
    suggestionForm.reset();
  });
}
// --- Animación Fade-In con Intersection Observer ---

const sections = document.querySelectorAll(".fade-section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Evita reanimar
      }
    });
  },
  {
    threshold: 0.2, // Se activa cuando el 20% es visible
  }
);

sections.forEach((section) => observer.observe(section));
