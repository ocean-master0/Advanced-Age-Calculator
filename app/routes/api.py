from flask import Blueprint, request
from app.services.age_service import calculate_age
from app.validators.date_validator import validate_date_string
from app.utils.response import make_success_response, make_error_response
from app import limiter

api_bp = Blueprint('api', __name__)

@api_bp.route('/calculate', methods=['POST'])
@limiter.limit('30 per minute')
def calculate():
    if not request.is_json:
        return make_error_response('Content-Type must be application/json', 415)

    data = request.get_json(silent=True)
    if not data:
        return make_error_response('Request body must be valid JSON', 400)

    birth_date = data.get('birth_date', '').strip() if isinstance(data.get('birth_date'), str) else ''
    current_date = data.get('current_date', '').strip() if isinstance(data.get('current_date'), str) else ''

    errors = []
    errors.extend(validate_date_string(birth_date, 'birth_date'))
    errors.extend(validate_date_string(current_date, 'current_date'))

    if errors:
        return make_error_response('Validation failed', 422, errors)

    try:
        result = calculate_age(birth_date, current_date)
        return make_success_response(result.to_dict())
    except ValueError as e:
        return make_error_response(str(e), 422)
