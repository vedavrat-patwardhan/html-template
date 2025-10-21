// Hindu Wedding Website - Enhanced JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeCountdown();
  initializeRSVP();
  initializeFlowerShower();
  initializeSmoothScroll();
});

// Countdown Timer
function initializeCountdown() {
  const countdownEl = document.getElementById("countdownTimer");
  if (!countdownEl) return;

  const weddingDate = new Date("2026-02-26T11:13:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      countdownEl.innerHTML =
        '<p class="countdown-expired">विवाह सोहळा सुरू झाला आहे! 🎉</p>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownEl.innerHTML = `
      <div class="countdown-box">
                <span class="countdown-number">${days}</span>
                <span class="countdown-label">दिवस</span>
            </div>
      <div class="countdown-box">
                <span class="countdown-number">${hours}</span>
                <span class="countdown-label">तास</span>
            </div>
      <div class="countdown-box">
                <span class="countdown-number">${minutes}</span>
                <span class="countdown-label">मिनिटे</span>
            </div>
      <div class="countdown-box">
                <span class="countdown-number">${seconds}</span>
                <span class="countdown-label">सेकंद</span>
            </div>
        `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// RSVP Form
function initializeRSVP() {
  const form = document.getElementById("rsvpForm");
  const messageEl = document.getElementById("rsvpMessage");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("guestName").value,
      phone: document.getElementById("guestPhone").value,
      attendance: document.getElementById("attendance").value,
      guests: document.getElementById("guests").value,
      message: document.getElementById("message").value,
      timestamp: getIndianDateTime(),
    };

    // Validate form
    if (!validateForm(formData)) {
      return;
    }

    // Submit to Google Sheets
    submitToGoogleSheets(formData);
  });

  // Phone number validation for Indian numbers
  function validateIndianPhone(phone) {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if it's a valid Indian mobile number
    // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
    const indianMobileRegex = /^[6-9]\d{9}$/;

    // Also accept numbers with +91 prefix
    const withCountryCode =
      cleanPhone.startsWith("91") &&
      indianMobileRegex.test(cleanPhone.substring(2));
    const withoutCountryCode = indianMobileRegex.test(cleanPhone);

    return withCountryCode || withoutCountryCode;
  }

  // Form validation
  function validateForm(formData) {
    let isValid = true;

    // Clear previous errors and styling
    clearErrors();
    clearFieldStyling();

    // Name validation
    if (!formData.name.trim()) {
      showFieldError("nameError", "कृपया आपले नाव टाका");
      document.getElementById("guestName").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("guestName").classList.add("success");
    }

    // Phone validation
    if (!formData.phone.trim()) {
      showFieldError("phoneError", "कृपया फोन नंबर टाका");
      document.getElementById("guestPhone").classList.add("error");
      isValid = false;
    } else if (!validateIndianPhone(formData.phone)) {
      showFieldError(
        "phoneError",
        "कृपया वैध भारतीय फोन नंबर टाका (उदा: 9876543210)"
      );
      document.getElementById("guestPhone").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("guestPhone").classList.add("success");
    }

    // Attendance validation
    if (!formData.attendance) {
      showFieldError("attendanceError", "कृपया उपस्थिती निवडा");
      document.getElementById("attendanceDropdown").classList.add("error");
      isValid = false;
    } else {
      document.getElementById("attendanceDropdown").classList.add("success");
    }

    return isValid;
  }

  function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
      element.style.display = "none";
    });
  }

  function clearFieldStyling() {
    const inputs = document.querySelectorAll("input, .custom-dropdown");
    inputs.forEach((input) => {
      input.classList.remove("error", "success");
    });
  }

  // Custom dropdown functionality
  function initializeCustomDropdown() {
    const dropdown = document.getElementById("attendanceDropdown");
    const selected = document.getElementById("attendanceSelected");
    const options = document.getElementById("attendanceOptions");
    const hiddenInput = document.getElementById("attendance");

    // Toggle dropdown
    selected.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    // Handle option selection
    options.addEventListener("click", function (e) {
      if (e.target.classList.contains("dropdown-option")) {
        const value = e.target.getAttribute("data-value");
        const text = e.target.textContent;

        selected.querySelector("span").textContent = text;
        hiddenInput.value = value;

        dropdown.classList.remove("active");

        // Clear error if any
        showFieldError("attendanceError", "");
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  // Initialize custom dropdown
  initializeCustomDropdown();

  // Phone input restrictions
  function initializePhoneInput() {
    const phoneInput = document.getElementById("guestPhone");

    phoneInput.addEventListener("input", function (e) {
      // Remove any non-numeric characters except +, -, (, ), and spaces
      let value = e.target.value;
      value = value.replace(/[^0-9+\-\(\)\s]/g, "");
      e.target.value = value;
    });

    phoneInput.addEventListener("keypress", function (e) {
      // Allow: backspace, delete, tab, escape, enter
      if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)
      ) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105) &&
        e.keyCode !== 43 && // +
        e.keyCode !== 45 && // -
        e.keyCode !== 40 && // (
        e.keyCode !== 41
      ) {
        // )
        e.preventDefault();
      }
    });
  }

  // Initialize phone input restrictions
  initializePhoneInput();

  // Get Indian date and time in readable format
  function getIndianDateTime() {
    const now = new Date();

    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    // Format as readable Indian date
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };

    return now.toLocaleString("en-IN", options);
  }

  async function submitToGoogleSheets(formData) {
    const loader = document.getElementById("formLoader");

    try {
      // Show loader
      loader.classList.add("active");

      // Replace with your Google Apps Script URL
      const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbyoJQGqEp2NhSIGyt7YWCEtfZQ9hiGjleElzofdxr6R0GZgmPl7qP4jQp62-7toz2k/exec";

      // const DEPLOYMENT_ID =
      //   "AKfycbyoJQGqEp2NhSIGyt7YWCEtfZQ9hiGjleElzofdxr6R0GZgmPl7qP4jQp62-7toz2k";
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Hide loader
      loader.classList.remove("active");

      // Show success message
      showMessage(
        "धन्यवाद! तुमची उपस्थिती नोंदवली गेली आहे. आम्ही तुमची वाट पाहत आहोत! 🙏",
        "success"
      );

      // Reset form
      form.reset();
      clearFieldStyling();
    } catch (error) {
      // Hide loader
      loader.classList.remove("active");

      console.error("Error submitting to Google Sheets:", error);
      showMessage("कृपया पुन्हा प्रयत्न करा. त्रुटी आली आहे.", "error");
    }
  }

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `rsvp-message ${type}`;

    setTimeout(() => {
      messageEl.style.display = "none";
      messageEl.className = "rsvp-message";
    }, 5000);
  }
}

// Enhanced Flower Petal Shower Animation
function initializeFlowerShower() {
  const programSection = document.querySelector(".program-section");
  const petalContainer = document.getElementById("petalShower");
  let hasTriggered = false;
  let settledPetals = [];

  if (!programSection || !petalContainer) return;

  // 8 Different Flower Petal SVG Designs
  const petalSVGs = [
    // Design 1: Classic Lotus
    `<svg viewBox="0 0 40 40" width="20" height="20">
      <circle cx="20" cy="20" r="8" fill="#ff9933" opacity="0.8"/>
      <circle cx="14" cy="20" r="5" fill="#ffd700" opacity="0.75"/>
      <circle cx="26" cy="20" r="5" fill="#ffd700" opacity="0.75"/>
      <circle cx="20" cy="14" r="5" fill="#ffd700" opacity="0.75"/>
      <circle cx="20" cy="26" r="5" fill="#ffd700" opacity="0.75"/>
      <circle cx="20" cy="20" r="3" fill="#d4af37"/>
    </svg>`,

    // Design 2: Rose Petal
    `<svg viewBox="0 0 40 40" width="18" height="18">
      <ellipse cx="20" cy="20" rx="10" ry="14" fill="#ff6b35" opacity="0.7" transform="rotate(45 20 20)"/>
      <ellipse cx="20" cy="20" rx="10" ry="14" fill="#ff9933" opacity="0.6" transform="rotate(-45 20 20)"/>
      <circle cx="20" cy="20" r="4" fill="#ffd700"/>
    </svg>`,

    // Design 3: Marigold
    `<svg viewBox="0 0 40 40" width="22" height="22">
      <path d="M20 10 L24 18 L20 26 L16 18 Z" fill="#ff9933" opacity="0.8"/>
      <path d="M10 20 L18 24 L26 20 L18 16 Z" fill="#ffa500" opacity="0.8"/>
      <circle cx="20" cy="20" r="5" fill="#ffd700" opacity="0.7"/>
    </svg>`,

    // Design 4: Jasmine
    `<svg viewBox="0 0 40 40" width="16" height="16">
      <circle cx="20" cy="20" r="6" fill="#fff" opacity="0.9"/>
      <circle cx="15" cy="20" r="4" fill="#fffacd" opacity="0.8"/>
      <circle cx="25" cy="20" r="4" fill="#fffacd" opacity="0.8"/>
      <circle cx="20" cy="15" r="4" fill="#fffacd" opacity="0.8"/>
      <circle cx="20" cy="25" r="4" fill="#fffacd" opacity="0.8"/>
      <circle cx="20" cy="20" r="2" fill="#ffd700"/>
    </svg>`,

    // Design 5: Hibiscus
    `<svg viewBox="0 0 40 40" width="20" height="20">
      <ellipse cx="20" cy="20" rx="8" ry="12" fill="#ff1493" opacity="0.6" transform="rotate(0 20 20)"/>
      <ellipse cx="20" cy="20" rx="8" ry="12" fill="#ff69b4" opacity="0.5" transform="rotate(72 20 20)"/>
      <ellipse cx="20" cy="20" rx="8" ry="12" fill="#ff1493" opacity="0.6" transform="rotate(144 20 20)"/>
      <circle cx="20" cy="20" r="3" fill="#ffd700"/>
    </svg>`,

    // Design 6: Sunflower Petal
    `<svg viewBox="0 0 40 40" width="19" height="19">
      <ellipse cx="20" cy="20" rx="12" ry="6" fill="#ffd700" opacity="0.8"/>
      <ellipse cx="20" cy="20" rx="6" ry="12" fill="#ffa500" opacity="0.8"/>
      <circle cx="20" cy="20" r="4" fill="#8b4513" opacity="0.7"/>
    </svg>`,

    // Design 7: Plumeria
    `<svg viewBox="0 0 40 40" width="18" height="18">
      <path d="M20 5 Q25 15 20 20 Q15 15 20 5" fill="#fff" opacity="0.9"/>
      <path d="M35 20 Q25 20 20 20 Q25 25 35 20" fill="#fffacd" opacity="0.8"/>
      <path d="M20 35 Q15 25 20 20 Q25 25 20 35" fill="#fff" opacity="0.9"/>
      <path d="M5 20 Q15 20 20 20 Q15 15 5 20" fill="#fffacd" opacity="0.8"/>
      <circle cx="20" cy="20" r="3" fill="#ffd700"/>
    </svg>`,

    // Design 8: Chrysanthemum
    `<svg viewBox="0 0 40 40" width="21" height="21">
      <circle cx="20" cy="20" r="10" fill="#ff9933" opacity="0.3"/>
      <circle cx="12" cy="20" r="6" fill="#ffd700" opacity="0.6"/>
      <circle cx="28" cy="20" r="6" fill="#ffd700" opacity="0.6"/>
      <circle cx="20" cy="12" r="6" fill="#ffd700" opacity="0.6"/>
      <circle cx="20" cy="28" r="6" fill="#ffd700" opacity="0.6"/>
      <circle cx="15" cy="15" r="5" fill="#ffa500" opacity="0.5"/>
      <circle cx="25" cy="15" r="5" fill="#ffa500" opacity="0.5"/>
      <circle cx="15" cy="25" r="5" fill="#ffa500" opacity="0.5"/>
      <circle cx="25" cy="25" r="5" fill="#ffa500" opacity="0.5"/>
      <circle cx="20" cy="20" r="4" fill="#d4af37"/>
    </svg>`,
  ];

  function createPetal() {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.innerHTML = petalSVGs[Math.floor(Math.random() * petalSVGs.length)];
    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDuration = 4 + Math.random() * 3 + "s";
    petal.style.animationDelay = Math.random() * 1 + "s";
    return petal;
  }

  function triggerPetalShower() {
    if (hasTriggered) return;
    hasTriggered = true;

    // Create 100 petals for a grand shower
    for (let i = 0; i < 100; i++) {
      const petal = createPetal();
      petalContainer.appendChild(petal);
      settledPetals.push(petal);
    }

    // After 7 seconds, settle petals at bottom
    setTimeout(() => {
      settledPetals.forEach((petal) => {
        petal.classList.add("settled");
      });
    }, 7000);

    // Clean up after 12 seconds (fade out)
    setTimeout(() => {
      settledPetals.forEach((petal) => {
        petal.style.transition = "opacity 2s ease-out";
        petal.style.opacity = "0";
      });
      setTimeout(() => {
        petalContainer.innerHTML = "";
        settledPetals = [];
        hasTriggered = false; // Allow re-trigger
      }, 2000);
    }, 12000);
  }

  // Intersection Observer for scroll trigger
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggered) {
          triggerPetalShower();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(programSection);
}

// Smooth Scroll for Navigation
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Console Welcome Message
console.log(
  `
%c✨ वेदव्रत & कोमल - विवाह आमंत्रण ✨
%cआमच्या विशेष दिवसाला आपले स्वागत आहे!
२६ फेब्रुवारी २०२६
`,
  "color: #d4af37; font-size: 20px; font-weight: bold;",
  "color: #ff9933; font-size: 14px;"
);
