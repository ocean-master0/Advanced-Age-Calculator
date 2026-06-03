(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const currentDateInput = $('current_date');
    const birthDateInput = $('birth_date');
    const themeToggle = $('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const ageForm = $('age-form');
    const resultSection = $('result-section');
    const errorSection = $('error-message');
    const errorText = errorSection.querySelector('.error-text');
    const calculateBtn = $('calculate-btn');
    const btnText = calculateBtn.querySelector('.btn-text');

    const today = stripTime(new Date());
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = monthNames.map(function (m) { return m.slice(0, 3); });
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    function stripTime(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function formatDate(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function parseDateValue(value) {
        if (!value) return null;
        var parts = value.split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return null;
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function isSameDay(left, right) {
        return left && right
            && left.getFullYear() === right.getFullYear()
            && left.getMonth() === right.getMonth()
            && left.getDate() === right.getDate();
    }

    var activeDatePicker = null;

    function VanillaDatePicker(input, options) {
        options = options || {};
        this.input = input;
        this.maxDate = options.maxDate ? stripTime(options.maxDate) : null;
        this.onChange = options.onChange || function () {};
        this.selectedDate = options.defaultDate ? stripTime(options.defaultDate) : null;
        this.viewDate = this.selectedDate ? new Date(this.selectedDate) : new Date(today);
        this.mode = 'day';
        this.isOpen = false;

        this.popover = document.createElement('div');
        this.popover.className = 'vanilla-calendar';
        this.popover.setAttribute('role', 'dialog');
        this.popover.setAttribute('aria-label', (input.name || 'Date') + ' calendar');
        this.popover.hidden = true;
        document.body.appendChild(this.popover);

        if (this.selectedDate) {
            this.input.value = formatDate(this.selectedDate);
        }

        this.popover.addEventListener('mousedown', function (e) { e.stopPropagation(); });
        this.popover.addEventListener('click', function (e) { e.stopPropagation(); });

        this.input.addEventListener('click', function (e) {
            e.stopPropagation();
            this.open();
        }.bind(this));
        this.input.addEventListener('focus', function () { this.open(); }.bind(this));
        this.input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.moveView(-1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); this.moveView(1); }
        }.bind(this));

        document.addEventListener('mousedown', function (e) {
            if (!this.popover.contains(e.target) && e.target !== this.input) {
                this.close();
            }
        }.bind(this));

        window.addEventListener('resize', function () { this.positionCalendar(); }.bind(this));
        window.addEventListener('scroll', function () { this.positionCalendar(); }.bind(this), true);

        this.render();
    }

    VanillaDatePicker.prototype.open = function () {
        if (activeDatePicker && activeDatePicker !== this) {
            activeDatePicker.close();
        }
        activeDatePicker = this;
        this.isOpen = true;
        this.popover.hidden = false;
        this.render();
        this.positionCalendar();
    };

    VanillaDatePicker.prototype.close = function () {
        this.isOpen = false;
        this.popover.hidden = true;
        if (activeDatePicker === this) {
            activeDatePicker = null;
        }
    };

    VanillaDatePicker.prototype.positionCalendar = function () {
        if (!this.isOpen) return;
        var rect = this.input.getBoundingClientRect();
        var calendarWidth = this.popover.offsetWidth || 294;
        var viewportWidth = document.documentElement.clientWidth;
        var left = Math.min(
            Math.max(12, rect.left + window.scrollX),
            window.scrollX + viewportWidth - calendarWidth - 12
        );
        var top = rect.bottom + window.scrollY + 10;
        this.popover.style.left = left + 'px';
        this.popover.style.top = top + 'px';
    };

    VanillaDatePicker.prototype.selectDate = function (date) {
        var cleanDate = stripTime(date);
        if (this.maxDate && cleanDate > this.maxDate) return;
        this.selectedDate = cleanDate;
        this.viewDate = new Date(cleanDate);
        this.input.value = formatDate(cleanDate);
        this.onChange();
        this.close();
    };

    VanillaDatePicker.prototype.clear = function () {
        this.selectedDate = null;
        this.input.value = '';
        this.render();
    };

    VanillaDatePicker.prototype.moveView = function (direction) {
        if (this.mode === 'day') {
            this.viewDate.setMonth(this.viewDate.getMonth() + direction);
        } else if (this.mode === 'month') {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + direction);
        } else {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + (direction * 12));
        }
        this.render();
    };

    VanillaDatePicker.prototype.showCurrentMonth = function () {
        this.mode = 'day';
        this.viewDate = new Date(today);
        this.render();
    };

    VanillaDatePicker.prototype.showToday = function () {
        this.selectDate(today);
    };

    VanillaDatePicker.prototype.getTitle = function () {
        if (this.mode === 'day') {
            return monthNames[this.viewDate.getMonth()] + ' ' + this.viewDate.getFullYear();
        }
        if (this.mode === 'month') {
            return String(this.viewDate.getFullYear());
        }
        var start = this.getYearGridStart();
        return start + ' - ' + (start + 11);
    };

    VanillaDatePicker.prototype.getYearGridStart = function () {
        var year = this.viewDate.getFullYear();
        return year - (year % 12);
    };

    VanillaDatePicker.prototype.render = function () {
        this.popover.innerHTML = '';
        this.popover.appendChild(this.renderControls());
        if (this.mode === 'day') {
            this.popover.appendChild(this.renderDayView());
            this.popover.appendChild(this.renderQuickActions());
        } else if (this.mode === 'month') {
            this.popover.appendChild(this.renderMonthView());
        } else {
            this.popover.appendChild(this.renderYearView());
        }
    };

    VanillaDatePicker.prototype.renderControls = function () {
        var controls = document.createElement('div');
        controls.className = 'calendar-controls';
        var prev = this.createIconButton('Previous', 'bi-chevron-left');
        var next = this.createIconButton('Next', 'bi-chevron-right');
        var title = document.createElement('button');
        title.type = 'button';
        title.className = 'calendar-title';
        title.textContent = this.getTitle();
        title.addEventListener('click', function () {
            if (this.mode === 'day') this.mode = 'month';
            else if (this.mode === 'month') this.mode = 'year';
            else this.mode = 'day';
            this.render();
        }.bind(this));
        prev.addEventListener('click', function () { this.moveView(-1); }.bind(this));
        next.addEventListener('click', function () { this.moveView(1); }.bind(this));
        controls.append(prev, title, next);
        return controls;
    };

    VanillaDatePicker.prototype.createIconButton = function (label, iconClass) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-icon-btn';
        button.setAttribute('aria-label', label);
        button.innerHTML = '<i class="bi ' + iconClass + '" aria-hidden="true"></i>';
        return button;
    };

    VanillaDatePicker.prototype.renderDayView = function () {
        var table = document.createElement('table');
        table.className = 'calendar-table day-view';
        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');
        weekDays.forEach(function (day) {
            var th = document.createElement('th');
            th.textContent = day;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        var year = this.viewDate.getFullYear();
        var month = this.viewDate.getMonth();
        var firstDay = new Date(year, month, 1);
        var mondayOffset = (firstDay.getDay() + 6) % 7;
        var gridStart = new Date(year, month, 1 - mondayOffset);

        for (var week = 0; week < 6; week++) {
            var row = document.createElement('tr');
            for (var col = 0; col < 7; col++) {
                var cellDate = new Date(gridStart);
                cellDate.setDate(gridStart.getDate() + (week * 7) + col);
                row.appendChild(this.renderDayCell(cellDate, month));
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        return table;
    };

    VanillaDatePicker.prototype.renderDayCell = function (date, activeMonth) {
        var td = document.createElement('td');
        var button = document.createElement('button');
        var cleanDate = stripTime(date);
        var isDisabled = this.maxDate && cleanDate > this.maxDate;
        button.type = 'button';
        button.className = 'calendar-cell day-cell';
        button.textContent = date.getDate();
        if (date.getMonth() !== activeMonth) button.classList.add('outside-range');
        if (isSameDay(cleanDate, today)) button.classList.add('today');
        if (isSameDay(cleanDate, this.selectedDate)) button.classList.add('selected');
        if (isDisabled) {
            button.classList.add('disabled');
            button.disabled = true;
        }
        button.addEventListener('click', function () { this.selectDate(cleanDate); }.bind(this));
        td.appendChild(button);
        return td;
    };

    VanillaDatePicker.prototype.renderMonthView = function () {
        var grid = document.createElement('div');
        grid.className = 'calendar-grid month-grid';
        shortMonths.forEach(function (month, index) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'calendar-cell wide-cell';
            button.textContent = month;
            if (this.selectedDate
                && this.selectedDate.getFullYear() === this.viewDate.getFullYear()
                && this.selectedDate.getMonth() === index) {
                button.classList.add('selected');
            }
            button.addEventListener('click', function () {
                this.viewDate.setMonth(index);
                this.mode = 'day';
                this.render();
            }.bind(this));
            grid.appendChild(button);
        }.bind(this));
        return grid;
    };

    VanillaDatePicker.prototype.renderYearView = function () {
        var grid = document.createElement('div');
        grid.className = 'calendar-grid year-grid';
        var start = this.getYearGridStart();
        for (var offset = 0; offset < 12; offset++) {
            (function (year) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'calendar-cell wide-cell';
                button.textContent = year;
                if (this.selectedDate && this.selectedDate.getFullYear() === year) {
                    button.classList.add('selected');
                }
                button.addEventListener('click', function () {
                    this.viewDate.setFullYear(year);
                    this.mode = 'month';
                    this.render();
                }.bind(this));
                grid.appendChild(button);
            }.bind(this))(start + offset);
        }
        return grid;
    };

    VanillaDatePicker.prototype.renderQuickActions = function () {
        var actions = document.createElement('div');
        actions.className = 'calendar-actions';
        var todayButton = document.createElement('button');
        todayButton.type = 'button';
        todayButton.textContent = 'Today';
        todayButton.addEventListener('click', function () { this.showToday(); }.bind(this));
        var monthButton = document.createElement('button');
        monthButton.type = 'button';
        monthButton.textContent = 'Current month';
        monthButton.addEventListener('click', function () { this.showCurrentMonth(); }.bind(this));
        actions.append(todayButton, monthButton);
        return actions;
    };

    var birthPicker = new VanillaDatePicker(birthDateInput, {
        maxDate: today,
        onChange: validateDates
    });

    new VanillaDatePicker(currentDateInput, {
        defaultDate: today,
        maxDate: today,
        onChange: validateDates
    });

    function validateDates() {
        var birthDate = parseDateValue(birthDateInput.value);
        var currentDate = parseDateValue(currentDateInput.value);
        if (birthDate && currentDate && birthDate > currentDate) {
            showError('Birth date cannot be after the current date!');
            birthPicker.clear();
        } else {
            hideError();
        }
    }

    function setLoading(isLoading) {
        calculateBtn.disabled = isLoading;
        btnText.textContent = isLoading ? 'Calculating...' : 'Reveal Age';
    }

    function callApi(birthDate, currentDate) {
        return fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ birth_date: birthDate, current_date: currentDate })
        }).then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) {
                    throw new Error(data.message || 'Calculation failed');
                }
                if (!data.success) {
                    throw new Error(data.message || 'Calculation failed');
                }
                return data.data;
            });
        });
    }

    if (ageForm) {
        ageForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var birthDate = parseDateValue(birthDateInput.value);
            var currentDate = parseDateValue(currentDateInput.value);
            if (!birthDate || !currentDate) {
                showError('Please select both dates.');
                return;
            }
            if (birthDate > currentDate) {
                showError('Birth date cannot be after the current date!');
                return;
            }
            hideError();
            setLoading(true);

            callApi(birthDateInput.value, currentDateInput.value).then(function (data) {
                updateUI(data);
                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }).catch(function (err) {
                showError(err.message);
            }).finally(function () {
                setLoading(false);
            });
        });
    }

    function updateUI(data) {
        $('years-val').textContent = data.years;
        $('full-age-text').textContent = data.formatted.years_months_days;
        $('months-val').textContent = data.formatted.months;
        $('weeks-val').textContent = data.formatted.weeks;
        $('days-val').textContent = data.formatted.days;
        $('hours-val').textContent = data.formatted.hours;
        $('minutes-val').textContent = data.formatted.minutes;
        startLiveCounter(data.total_seconds);
    }

    var counterInterval = null;

    function startLiveCounter(startSeconds) {
        if (counterInterval) {
            clearInterval(counterInterval);
            counterInterval = null;
        }
        var counterEl = $('seconds-counter');
        var startTime = Date.now();
        var baseSeconds = startSeconds;

        function tick() {
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            counterEl.textContent = (baseSeconds + elapsed).toLocaleString();
            var drift = Date.now() - startTime - (elapsed * 1000);
            counterInterval = setTimeout(tick, 1000 - drift);
        }

        counterEl.textContent = baseSeconds.toLocaleString();
        counterInterval = setTimeout(tick, 1000);
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorSection.style.display = 'flex';
        resultSection.style.display = 'none';
    }

    function hideError() {
        errorSection.style.display = 'none';
    }

    var savedTheme = localStorage.getItem('theme') || 'oled';
    if (savedTheme === 'oled') {
        document.body.classList.add('oled-mode');
        themeIcon.className = 'bi bi-moon-stars-fill';
    }

    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('oled-mode');
        var isOled = document.body.classList.contains('oled-mode');
        themeIcon.className = isOled ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
        localStorage.setItem('theme', isOled ? 'oled' : 'light');
    });

    var shareBtn = $('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            var fullAge = $('full-age-text').textContent;
            var seconds = $('seconds-counter').textContent;
            var shareText = 'I have been alive for ' + fullAge + ' (' + seconds + ' seconds)!';
            if (navigator.share) {
                navigator.share({ title: 'My Age Calculator', text: shareText, url: window.location.href })
                    .catch(function () {});
            } else {
                navigator.clipboard.writeText(shareText + ' ' + window.location.href)
                    .then(function () { alert('Link and age info copied to clipboard!'); })
                    .catch(function () {});
            }
        });
    }

    var downloadBtn = $('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            if (resultSection.style.display === 'none') return;
            var fullAge = $('full-age-text').textContent;
            var seconds = $('seconds-counter').textContent;
            var content = 'AGE CALCULATOR REPORT\n';
            content += '=====================\n';
            content += 'Date: ' + new Date().toLocaleDateString() + '\n\n';
            content += 'Strict Age: ' + fullAge + '\n';
            content += 'Total Seconds Alive: ' + seconds + '\n\n';
            content += 'Breakdown:\n';
            content += '- Months: ' + $('months-val').textContent + '\n';
            content += '- Weeks: ' + $('weeks-val').textContent + '\n';
            content += '- Days: ' + $('days-val').textContent + '\n';
            content += '- Hours: ' + $('hours-val').textContent + '\n';
            content += '- Minutes: ' + $('minutes-val').textContent + '\n';
            var blob = new Blob([content], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'Age-Calculator-Report-' + Date.now() + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    var aboutModal = $('about-modal');
    var openBtn = $('open-about');
    var closeBtn = document.querySelector('.close-modal');

    if (openBtn && aboutModal) {
        openBtn.addEventListener('click', function (event) {
            event.preventDefault();
            aboutModal.style.display = 'flex';
            aboutModal.focus();
        });

        closeBtn.addEventListener('click', function () {
            aboutModal.style.display = 'none';
        });

        aboutModal.addEventListener('click', function (event) {
            if (event.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && aboutModal.style.display === 'flex') {
                aboutModal.style.display = 'none';
            }
        });
    }
})();
