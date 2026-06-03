from datetime import datetime
from dateutil.relativedelta import relativedelta

AGE_UNITS = {
    'years_months_days': lambda y, m, d, td, h, mi, s: f"{y} years, {m} months, {d} days",
    'months': lambda y, m, d, td, h, mi, s: f"{(y * 12) + m:,} months, {d} days",
    'weeks': lambda y, m, d, td, h, mi, s: f"{td // 7:,} weeks, {td % 7} days",
    'days': lambda y, m, d, td, h, mi, s: f"{td:,} days",
    'hours': lambda y, m, d, td, h, mi, s: f"{td * 24:,} hours",
    'minutes': lambda y, m, d, td, h, mi, s: f"{td * 24 * 60:,} minutes",
    'seconds': lambda y, m, d, td, h, mi, s: f"{td * 24 * 60 * 60:,} seconds",
}

class AgeCalculationResult:
    def __init__(self, years, months, days, total_days, total_seconds):
        self.years = years
        self.months = months
        self.days = days
        self.total_days = total_days
        self.total_seconds = total_seconds
        self.formatted = {}
        for key, formatter in AGE_UNITS.items():
            self.formatted[key] = formatter(years, months, days, total_days, 0, 0, 0)

    def to_dict(self):
        return {
            'years': self.years,
            'months': self.months,
            'days': self.days,
            'total_days': self.total_days,
            'total_seconds': self.total_seconds,
            'formatted': self.formatted
        }

def calculate_age(birth_date_str, current_date_str):
    try:
        birth = datetime.strptime(birth_date_str, '%Y-%m-%d')
        current = datetime.strptime(current_date_str, '%Y-%m-%d')
    except ValueError:
        raise ValueError('Dates must be in YYYY-MM-DD format')

    if birth > current:
        raise ValueError('Birth date cannot be after current date')

    diff = relativedelta(current, birth)
    total_days = (current - birth).days

    return AgeCalculationResult(
        years=diff.years,
        months=diff.months,
        days=diff.days,
        total_days=total_days,
        total_seconds=total_days * 86400
    )
