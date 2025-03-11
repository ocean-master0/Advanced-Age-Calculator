document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    const currentDateInput = document.getElementById('current_date');
    const birthDateInput = document.getElementById('birth_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (currentDateInput) {
        currentDateInput.value = today;
        currentDateInput.setAttribute('max', today);
    }
    
    if (birthDateInput) {
        birthDateInput.setAttribute('max', today);
    }
    
    // Theme toggling
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check if user has a theme preference stored
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Real-time seconds counter
    const secondsCounter = document.getElementById('seconds-counter');
    if (secondsCounter) {
        let startSeconds = parseInt(secondsCounter.getAttribute('data-seconds'));
        let startTime = Date.now();
        
        function updateCounter() {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const currentSeconds = startSeconds + elapsedSeconds;
            secondsCounter.textContent = currentSeconds.toLocaleString();
        }
        
        // Update immediately and then every second
        updateCounter();
        setInterval(updateCounter, 1000);
    }
    
    // Form submission animation
    const ageForm = document.getElementById('age-form');
    if (ageForm) {
        ageForm.addEventListener('submit', function() {
            const button = this.querySelector('.calculate-btn');
            const originalContent = button.innerHTML;
            
            button.innerHTML = '<span class="btn-icon"><i class="fas fa-spinner fa-spin"></i></span><span class="btn-text">Calculating...</span>';
            button.disabled = true;
            
            // Re-enable after 3 seconds in case of error
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.disabled = false;
            }, 3000);
        });
    }
    
    // Date validation
    if (birthDateInput && currentDateInput) {
        birthDateInput.addEventListener('change', validateDates);
        currentDateInput.addEventListener('change', validateDates);
        
        function validateDates() {
            const birthDate = new Date(birthDateInput.value);
            const currentDate = new Date(currentDateInput.value);
            
            if (birthDate > currentDate) {
                alert('Birth date cannot be after current date!');
                birthDateInput.value = '';
            }
        }
    }
    
    // Share functionality
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                // Web Share API
                navigator.share({
                    title: 'My Age Calculation',
                    text: 'Check out my age calculation!',
                    url: window.location.href
                })
                .catch(error => console.log('Error sharing:', error));
            } else {
                // Fallback: copy to clipboard
                const url = window.location.href;
                navigator.clipboard.writeText(url)
                    .then(() => {
                        alert('Link copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                    });
            }
        });
    }
    
    // Download functionality
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const resultSection = document.getElementById('result-section');
            
            // Create a text version of the results
            let resultsText = 'AGE CALCULATION RESULTS\n\n';
            
            const cards = resultSection.querySelectorAll('.age-card');
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent;
                const value = card.querySelector('p').textContent;
                resultsText += `${title}: ${value}\n`;
            });
            
            // Create file and download
            const blob = new Blob([resultsText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'age_calculation.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // Modal functionality
    const openAboutBtn = document.getElementById('open-about');
    const aboutModal = document.getElementById('about-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (openAboutBtn && aboutModal) {
        openAboutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            aboutModal.style.display = 'flex';
        });
        
        closeModal.addEventListener('click', function() {
            aboutModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }
    
    // Add hover effects to result cards
    const resultCards = document.querySelectorAll('.age-card');
    resultCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    });
});
