from flask import jsonify

def make_success_response(data, status_code=200):
    return jsonify({'success': True, 'data': data}), status_code

def make_error_response(message, status_code=400, errors=None):
    body = {'success': False, 'message': message}
    if errors:
        body['errors'] = errors
    return jsonify(body), status_code
