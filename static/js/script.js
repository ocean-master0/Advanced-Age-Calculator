document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const currentDateInput = document.getElementById('current_date');
    const birthDateInput = document.getElementById('birth_date');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const secondsCounter = document.getElementById('seconds-counter');
    const ageForm = document.getElementById('age-form');
    const resultSection = document.getElementById('result-section');
    const errorSection = document.getElementById('error-message');
    const errorText = errorSection.querySelector('.error-text');

    const today = new Date();

    // --- Flatpickr Configuration ---
    const flatpickrConfig = {
        dateFormat: "Y-m-d",
        maxDate: today,
        enableTime: false,
        disableMobile: true,
        monthSelectorType: 'dropdown',
        yearSelectorType: 'dropdown',
        animate: true,
        altInput: true,
        altFormat: "F j, Y",
        locale: { firstDayOfWeek: 1 },
        onChange: validateDates
    };

    if (birthDateInput) flatpickr(birthDateInput, { ...flatpickrConfig });
    if (currentDateInput) flatpickr(currentDateInput, { ...flatpickrConfig, defaultDate: today });

    function validateDates() {
        if (birthDateInput.value && currentDateInput.value) {
            const birthDate = new Date(birthDateInput.value);
            const currentDate = new Date(currentDateInput.value);
            if (birthDate > currentDate) {
                showError('Birth date cannot be after the current date!');
                if (birthDateInput._flatpickr) birthDateInput._flatpickr.clear();
            } else {
                hideError();
            }
        }
    }

    // --- Core Age Calculation Logic ---
    function calculateAge(birth, current) {
        // Years, Months, Days
        let years = current.getFullYear() - birth.getFullYear();
        let months = current.getMonth() - birth.getMonth();
        let days = current.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            // Get days in previous month
            const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0).getDate();
            days += prevMonth;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        // Total differences for other units
        const diffTime = Math.abs(current - birth);
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;

        const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
        const totalMinutes = Math.floor(diffTime / (1000 * 60));
        const totalSeconds = Math.floor(diffTime / 1000);

        // Format numbers with commas
        const fmt = (n) => n.toLocaleString();

        return {
            years: years,
            months_strict: months,
            days_strict: days,
            total_months: (years * 12) + months,
            total_weeks: totalWeeks,
            total_days: totalDays,
            total_hours: totalHours,
            total_minutes: totalMinutes,
            total_seconds: totalSeconds,
            formatted: {
                years_months_days: `${years} years`, // Simplified for the big number
                full_text: `${years} years, ${months} months, ${days} days`,
                months: `${fmt((years * 12) + months)} months, ${days} days`,
                weeks: `${fmt(totalWeeks)} weeks, ${remainingDays} days`,
                days: `${fmt(totalDays)} days`,
                hours: `${fmt(totalHours)} hours`,
                minutes: `${fmt(totalMinutes)} minutes`
            }
        };
    }

    // --- Form Handling ---
    if (ageForm) {
        ageForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent page reload

            const birthValue = birthDateInput.value;
            const currentValue = currentDateInput.value;

            if (!birthValue || !currentValue) {
                showError("Please select both dates.");
                return;
            }

            const birthDate = new Date(birthValue);
            const currentDate = new Date(currentValue);

            // Button Animation
            const btn = this.querySelector('.calculate-btn');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            btnText.textContent = 'Revealing...';
            btn.disabled = true;
            btn.style.opacity = '0.9';

            // Simulate calculation delay for effect (can be removed for instant)
            setTimeout(() => {
                const result = calculateAge(birthDate, currentDate);
                updateUI(result);

                // Reset button
                btnText.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';

                // Show result section
                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 600);
        });
    }

    function updateUI(data) {
        // Main Years Display
        document.getElementById('years-val').textContent = data.years;
        document.getElementById('full-age-text').textContent = data.formatted.full_text;

        // Grid Stats
        document.getElementById('months-val').textContent = data.formatted.months;
        document.getElementById('weeks-val').textContent = data.formatted.weeks;
        document.getElementById('days-val').textContent = data.formatted.days;
        document.getElementById('hours-val').textContent = data.formatted.hours;
        document.getElementById('minutes-val').textContent = data.formatted.minutes;

        // Live Counter
        startLiveCounter(data.total_seconds);
    }

    let counterInterval;
    function startLiveCounter(startSeconds) {
        if (counterInterval) clearInterval(counterInterval);

        let currentSecs = startSeconds;
        const counterEl = document.getElementById('seconds-counter');

        // Initial set
        counterEl.textContent = currentSecs.toLocaleString();

        counterInterval = setInterval(() => {
            currentSecs++;
            counterEl.textContent = currentSecs.toLocaleString();
        }, 1000);
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorSection.style.display = 'flex';
        resultSection.style.display = 'none';
    }

    function hideError() {
        errorSection.style.display = 'none';
    }

    // --- Theme Management ---
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // --- Share & Download ---
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: 'My Age Chrono',
                        text: `Check out my age on Age Chrono!`,
                        url: window.location.href
                    });
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                }
            } catch (err) {
                console.log('Share closed');
            }
        });
    }

    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (resultSection.style.display === 'none') return;

            const fullAge = document.getElementById('full-age-text').textContent;
            const seconds = document.getElementById('seconds-counter').textContent;

            const content = `AGE CHRONO REPORT
================
Date: ${new Date().toLocaleDateString()}

Strict Age: ${fullAge}
Total Seconds Alive: ${seconds}

Breakdown:
- Months: ${document.getElementById('months-val').textContent}
- Weeks: ${document.getElementById('weeks-val').textContent}
- Days: ${document.getElementById('days-val').textContent}
- Hours: ${document.getElementById('hours-val').textContent}
- Minutes: ${document.getElementById('minutes-val').textContent}
`;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Age-Chrono-Report-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // Modal
    const aboutModal = document.getElementById('about-modal');
    const openBtn = document.getElementById('open-about');
    const closeBtn = document.querySelector('.close-modal');

    if (openBtn && aboutModal) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', () => aboutModal.style.display = 'none');
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) aboutModal.style.display = 'none';
        });
    }
});
