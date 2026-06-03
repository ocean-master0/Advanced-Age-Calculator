import re
from datetime import datetime

DATE_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def validate_date_string(date_str, field_name='date'):
    errors = []
    if not date_str or not isinstance(date_str, str):
        errors.append(f'{field_name} is required and must be a string')
        return errors

    date_str = date_str.strip()

    if not DATE_REGEX.match(date_str):
        errors.append(f'{field_name} must be in YYYY-MM-DD format')
        return errors

    try:
        datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        errors.append(f'{field_name} is not a valid calendar date')

    return errors
