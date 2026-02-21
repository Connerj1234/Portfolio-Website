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

  const projectSwitchButtons = document.querySelectorAll(".project-switch-btn");
  const projectViews = document.querySelectorAll(".project-view");

  if (projectSwitchButtons.length && projectViews.length) {
    const setProjectView = (viewKey) => {
      projectSwitchButtons.forEach((button) => {
        const isActive = button.dataset.projectView === viewKey;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      projectViews.forEach((view) => {
        const isActive = view.dataset.projectViewContent === viewKey;
        view.classList.toggle("active", isActive);
        view.setAttribute("aria-hidden", String(!isActive));
      });
    };

    projectSwitchButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setProjectView(button.dataset.projectView);
      });
    });
  }

  const githubCalendarRoot = document.querySelector(".calendar");
  if (githubCalendarRoot && typeof GitHubCalendar !== "undefined") {
    initializeCustomGitHubWidget(githubCalendarRoot, "Connerj1234");
  }
});

function initializeCustomGitHubWidget(root, username) {
  const source = document.createElement("div");
  source.className = "calendar-source";
  root.parentElement.appendChild(source);

  const observer = new MutationObserver(() => {
    const days = Array.from(source.querySelectorAll(".ContributionCalendar-day"));
    if (!days.length) return;
    observer.disconnect();
    renderCustomGitHubGrid(root, username, days);
  });

  observer.observe(source, { childList: true, subtree: true });

  GitHubCalendar(source, username, {
    responsive: false,
    tooltips: false,
    global_stats: false,
  });
}

async function fetchFourMonthContributionTotal(username, startDate, endDate) {
  try {
    const endpoint = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return null;

    const payload = await response.json();
    const items = Array.isArray(payload?.contributions) ? payload.contributions : [];

    let total = 0;
    items.forEach((item) => {
      if (!item || typeof item.date !== "string") return;
      if (item.date >= startDate && item.date <= endDate) {
        total += Number(item.count) || 0;
      }
    });

    return total;
  } catch (error) {
    return null;
  }
}

function renderCustomGitHubGrid(root, username, dayNodes) {
  const extractContributionCount = (day) => {
    const attrCandidates = [
      day.getAttribute("data-count"),
      day.getAttribute("data-value"),
      day.getAttribute("aria-label"),
      day.getAttribute("title"),
      day.parentElement ? day.parentElement.getAttribute("data-original-title") : "",
      day.closest("[data-original-title]") ? day.closest("[data-original-title]").getAttribute("data-original-title") : "",
      day.dataset ? day.dataset.count : "",
      day.dataset ? day.dataset.value : "",
      day.querySelector("title") ? day.querySelector("title").textContent : "",
    ];

    for (const candidate of attrCandidates) {
      if (!candidate) continue;
      const numeric = Number(candidate);
      if (Number.isFinite(numeric)) return numeric;
      const match = String(candidate).match(/(\d+)\s+contributions?/i);
      if (match) return Number(match[1]);
      if (/no contributions?/i.test(String(candidate))) return 0;
    }

    return 0;
  };

  const contributions = dayNodes
    .map((day) => {
      const date = day.getAttribute("data-date");
      const level = Number(day.getAttribute("data-level")) || 0;
      const count = extractContributionCount(day);
      return { date, level, count };
    })
    .filter((entry) => entry.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!contributions.length) {
    root.textContent = "Unable to load contributions right now.";
    return;
  }

  const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lastDate = new Date(`${contributions[contributions.length - 1].date}T00:00:00Z`);
  const rangeStart = new Date(lastDate);
  rangeStart.setUTCMonth(rangeStart.getUTCMonth() - 4);
  rangeStart.setUTCDate(rangeStart.getUTCDate() + 1);

  const alignedStart = new Date(rangeStart);
  const mondayOffset = (alignedStart.getUTCDay() + 6) % 7;
  alignedStart.setUTCDate(alignedStart.getUTCDate() - mondayOffset);

  const alignedEnd = new Date(lastDate);
  const endOffset = (alignedEnd.getUTCDay() + 6) % 7;
  alignedEnd.setUTCDate(alignedEnd.getUTCDate() + (6 - endOffset));

  const contributionMap = new Map(contributions.map((entry) => [entry.date, entry]));
  const weeks = [];
  let cursor = new Date(alignedStart);
  while (cursor <= alignedEnd) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const dateKey = cursor.toISOString().slice(0, 10);
      const item = contributionMap.get(dateKey) || { date: dateKey, level: 0, count: 0 };
      week.push(item);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  let total = 0;
  contributions.forEach((entry) => {
    const entryDate = new Date(`${entry.date}T00:00:00Z`);
    if (entryDate >= rangeStart && entryDate <= lastDate) {
      total += entry.count;
    }
  });

  const monthMarkers = [];
  let previousMonthKey = "";
  weeks.forEach((week, index) => {
    const weekStart = new Date(`${week[0].date}T00:00:00Z`);
    const monthKey = `${weekStart.getUTCFullYear()}-${weekStart.getUTCMonth()}`;
    if (monthKey !== previousMonthKey) {
      monthMarkers.push({ index, label: monthShort[weekStart.getUTCMonth()] });
      previousMonthKey = monthKey;
    }
  });

  root.innerHTML = "";

  const link = document.createElement("a");
  link.className = "gh-activity-link";
  link.href = `https://github.com/${username}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const shell = document.createElement("div");
  shell.className = "gh-grid-shell";
  link.appendChild(shell);

  const months = document.createElement("div");
  months.className = "gh-months";
  monthMarkers.forEach((marker) => {
    const label = document.createElement("span");
    label.className = "gh-month-label";
    const denominator = Math.max(weeks.length - 1, 1);
    label.style.left = `${(marker.index / denominator) * 100}%`;
    label.textContent = marker.label;
    months.appendChild(label);
  });
  shell.appendChild(months);

  const weeksWrap = document.createElement("div");
  weeksWrap.className = "gh-weeks";
  weeks.forEach((week) => {
    const weekColumn = document.createElement("div");
    weekColumn.className = "gh-week";

    week.forEach((day) => {
      const cell = document.createElement("div");
      cell.className = `gh-day level-${day.level}`;
      cell.title = `${day.date}: ${day.count} contributions`;
      weekColumn.appendChild(cell);
    });

    weeksWrap.appendChild(weekColumn);
  });
  shell.appendChild(weeksWrap);
  root.appendChild(link);

  const summary = document.createElement("p");
  summary.className = "gh-summary";
  summary.textContent = `${total} contributions in the last 4 months`;
  root.appendChild(summary);

  const startKey = rangeStart.toISOString().slice(0, 10);
  const endKey = lastDate.toISOString().slice(0, 10);
  fetchFourMonthContributionTotal(username, startKey, endKey).then((apiTotal) => {
    if (typeof apiTotal === "number") {
      summary.textContent = `${apiTotal} contributions in the last 4 months`;
    }
  });
}

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
