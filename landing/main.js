function scrollToBook() {
  document.getElementById("book").scrollIntoView({ behavior: "smooth" });
}

async function submitBooking() {
  const button = document.getElementById("button");
  button.disabled = true;
  button.textContent = "Requesting...";

  const name = document.getElementById("name").value;
  const number = document.getElementById("number").value;
  const email = document.getElementById("email").value;
  const dates = document.getElementById("datepicker").value;
  const message = document.getElementById("message").value;

  const headers = new Headers({ "Content-Type": "application/json" });
  const body = JSON.stringify({ name, number, email, dates, message });

  try {
    const res = await fetch("https://smokinbarrel.vercel.app/api/book", { method: "POST", headers, body });
    button.textContent = res.ok ? "Request Sent!" : "Request Failed";
  } catch (err) {
    console.error("Booking error:", err);
    button.textContent = "Request Failed";
  }

  setTimeout(() => {
    button.disabled = false;
    button.textContent = "Request Booking";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const DateTime = easepick.DateTime;
  const now = new DateTime();
  const bookedDates = ["2024-02-03", "2024-02-04", "2024-02-05"].map(
    (d) => new DateTime(d, "YYYY-MM-DD"),
  );

  new easepick.create({
    element: document.getElementById("datepicker"),
    css: [
      "https://cdn.jsdelivr.net/npm/@easepick/core@1.2.0/dist/index.css",
      "https://cdn.jsdelivr.net/npm/@easepick/lock-plugin@1.2.0/dist/index.css",
    ],
    firstDay: 0,
    plugins: ["LockPlugin", "RangePlugin"],
    LockPlugin: {
      maxDate: now.clone().add(3, "month"),
      minDate: now,
      minDays: 4,
      filter: (date) => date.inArray(bookedDates),
    },
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Slow down hero video
  const heroVideo = document.querySelector(".hero-background");
  if (heroVideo) {
    heroVideo.playbackRate = 0.7; // 70% speed (30% slower)
  }

  const modal = document.getElementById("gallery-modal");
  const modalImg = document.getElementById("gallery-modal-image");
  const modalCaption = document.getElementById("gallery-modal-caption");
  const closeBtn = document.querySelector(".gallery-modal-close");
  const prevBtn = document.querySelector(".gallery-modal-prev");
  const nextBtn = document.querySelector(".gallery-modal-next");
  const modalBackdrop = document.querySelector(".gallery-modal-backdrop");

  const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
  const galleryItems = galleryCards.map((card) => ({
    src: card.dataset.image,
    caption: card.dataset.caption,
  }));

  let currentIndex = 0;

  function openModal(index) {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    modalImg.src = item.src;
    modalImg.alt = item.caption;
    modalCaption.textContent = item.caption;
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    const item = galleryItems[currentIndex];
    modalImg.src = item.src;
    modalImg.alt = item.caption;
    modalCaption.textContent = item.caption;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    modalImg.src = item.src;
    modalImg.alt = item.caption;
    modalCaption.textContent = item.caption;
  }

  galleryCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      openModal(index);
    });
  });

  [closeBtn, modalBackdrop].forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-visible")) return;

    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "ArrowLeft") {
      showPrev();
    } else if (event.key === "ArrowRight") {
      showNext();
    }
  });
});

