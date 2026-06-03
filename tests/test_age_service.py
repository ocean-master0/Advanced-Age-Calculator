import pytest
from datetime import datetime
from app.services.age_service import calculate_age, AgeCalculationResult

class TestAgeCalculationResult:
    def test_to_dict_returns_all_keys(self):
        result = AgeCalculationResult(34, 11, 19, 12772, 1103500800)
        d = result.to_dict()
        assert d['years'] == 34
        assert d['months'] == 11
        assert d['days'] == 19
        assert d['total_days'] == 12772
        assert d['total_seconds'] == 1103500800
        assert 'formatted' in d
        assert d['formatted']['years_months_days'] == '34 years, 11 months, 19 days'

class TestCalculateAge:
    def test_exact_same_date_returns_zero(self):
        result = calculate_age('2025-01-01', '2025-01-01')
        assert result.years == 0
        assert result.months == 0
        assert result.days == 0
        assert result.total_days == 0

    def test_one_year_exact(self):
        result = calculate_age('2024-01-01', '2025-01-01')
        assert result.years == 1
        assert result.months == 0
        assert result.days == 0

    def test_one_month_exact(self):
        result = calculate_age('2025-01-01', '2025-02-01')
        assert result.years == 0
        assert result.months == 1
        assert result.days == 0

    def test_one_day_exact(self):
        result = calculate_age('2025-01-01', '2025-01-02')
        assert result.years == 0
        assert result.months == 0
        assert result.days == 1
        assert result.total_days == 1

    def test_typical_age(self):
        result = calculate_age('1990-06-15', '2025-06-03')
        assert result.years == 34
        assert result.months == 11
        assert result.days == 19
        assert result.total_days == 12772
        assert result.total_seconds == 12772 * 86400

    def test_leap_year_birthday(self):
        result = calculate_age('2000-02-29', '2025-03-01')
        assert result.years == 25
        assert result.days == 1

    def test_february_28_vs_march_1_non_leap(self):
        result = calculate_age('2023-02-28', '2024-03-01')
        assert result.years == 1
        assert result.days > 0

    def test_month_boundary_jan31_to_feb1(self):
        result = calculate_age('2025-01-31', '2025-02-01')
        assert result.months == 0
        assert result.days == 1

    def test_year_boundary_dec31_to_jan1(self):
        result = calculate_age('2024-12-31', '2025-01-01')
        assert result.years == 0
        assert result.months == 0
        assert result.days == 1

    def test_birth_after_current_raises(self):
        with pytest.raises(ValueError, match='Birth date cannot be after current date'):
            calculate_age('2025-06-03', '1990-01-01')

    def test_invalid_date_format_raises(self):
        with pytest.raises(ValueError, match='Dates must be in YYYY-MM-DD format'):
            calculate_age('invalid', '2025-01-01')

    def test_large_date_range(self):
        result = calculate_age('1900-01-01', '2025-01-01')
        assert result.years == 125
        assert result.total_days > 45000

    def test_child_age(self):
        result = calculate_age('2020-06-01', '2025-06-03')
        assert result.years == 5
        assert result.days == 2

    def test_teenager_age(self):
        result = calculate_age('2010-05-15', '2025-06-03')
        assert result.years == 15
        assert result.days == 19

    def test_total_seconds_consistency(self):
        result = calculate_age('2000-01-01', '2025-01-01')
        assert result.total_seconds == result.total_days * 86400

    def test_formatted_outputs_consistency(self):
        result = calculate_age('1990-06-15', '2025-06-03')
        f = result.formatted
        assert str(result.years) in f['years_months_days']
        total_months = result.years * 12 + result.months
        assert str(total_months) in f['months']
        assert str(result.total_days) in f['days'].replace(',', '')
