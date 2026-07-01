document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const theme = document.getElementById("themeToggle");
  const menu = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");

  body.dataset.theme = localStorage.getItem("theme") || "light";

  if (theme) {
    theme.onclick = () => {
      body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", body.dataset.theme);
      updateTimelineProgress();
    };
  }

  if (menu && nav) {
    menu.onclick = () => nav.classList.toggle("open");
  }

  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach(element => {
    revealObserver.observe(element);
  });

  document.querySelectorAll(".expand-summary").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".expand-card");
      const entry = button.closest(".timeline-entry");
      const opened = card.classList.toggle("open");
      const icon = button.querySelector(".accordion-icon");

      if (entry) {
        entry.classList.toggle("open", opened);
      }

      if (icon) {
        icon.textContent = opened ? "−" : "+";
      }

      updateTimelineProgress();
    });
  });

  updateTimelineProgress();
});

function updateTimelineProgress() {
  document.querySelectorAll(".timeline-modern").forEach(timeline => {
    const rect = timeline.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    /*
      The progress line now follows a fixed visual point on the screen.
      This makes the timeline movement feel synced with scrolling instead
      of advancing too quickly.
    */
    const screenMarkerY = viewportHeight * 0.50;

    const lineTopOffset = 10;
    const lineBottomOffset = 10;
    const lineMaxHeight =
      timeline.offsetHeight - lineTopOffset - lineBottomOffset;

    /*
      Convert the screen marker into a position inside the timeline.
      If the marker is above the timeline, progress is 0.
      If the marker is below the timeline, progress is 100%.
    */
    let lineEndY = screenMarkerY - rect.top - lineTopOffset;
    lineEndY = Math.max(0, Math.min(lineMaxHeight, lineEndY));

    const progress = lineMaxHeight > 0 ? lineEndY / lineMaxHeight : 0;

    timeline.style.setProperty(
      "--timeline-progress",
      `${(progress * 100).toFixed(2)}%`
    );

    /*
      Highlight the most recent bullet that the progress line has reached.
      Scrolling down: bullet activates when the line passes it.
      Scrolling up: bullet deactivates when the line rolls back above it.
    */
    let activeEntry = null;

    timeline.querySelectorAll(".timeline-entry").forEach(entry => {
      const node = entry.querySelector(".timeline-node");

      if (!node) return;

      const nodeRect = node.getBoundingClientRect();
      const nodeCenterY =
        nodeRect.top - rect.top + nodeRect.height / 2 - lineTopOffset;

      if (lineEndY >= nodeCenterY) {
        activeEntry = entry;
      }
    });

    timeline.querySelectorAll(".timeline-entry").forEach(entry => {
      entry.classList.toggle("is-active", entry === activeEntry);
    });
  });
}

window.addEventListener("scroll", updateTimelineProgress, { passive: true });
window.addEventListener("resize", updateTimelineProgress);
