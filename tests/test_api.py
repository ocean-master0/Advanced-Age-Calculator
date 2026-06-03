import json
import pytest

class TestApiCalculate:
    def test_successful_calculation(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '1990-06-15',
            'current_date': '2025-06-03'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['success'] is True
        assert data['data']['years'] == 34
        assert data['data']['months'] == 11
        assert data['data']['days'] == 19

    def test_same_date(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '2025-01-01',
            'current_date': '2025-01-01'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['data']['years'] == 0
        assert data['data']['total_days'] == 0

    def test_birth_after_current(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '2025-06-03',
            'current_date': '1990-01-01'
        })
        assert resp.status_code == 422
        data = resp.get_json()
        assert data['success'] is False
        assert 'after current date' in data['message'].lower()

    def test_missing_birth_date(self, client):
        resp = client.post('/api/calculate', json={
            'current_date': '2025-01-01'
        })
        assert resp.status_code == 422
        data = resp.get_json()
        assert data['success'] is False
        assert 'birth_date' in str(data.get('errors', ''))

    def test_missing_current_date(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '1990-01-01'
        })
        assert resp.status_code == 422
        data = resp.get_json()
        assert data['success'] is False

    def test_both_dates_missing(self, client):
        resp = client.post('/api/calculate', json={})
        data = resp.get_json()
        assert data['success'] is False
        assert resp.status_code in (400, 422)

    def test_invalid_date_format(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': 'not-a-date',
            'current_date': '2025-01-01'
        })
        assert resp.status_code == 422
        data = resp.get_json()
        assert data['success'] is False

    def test_invalid_calendar_date(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '2025-02-30',
            'current_date': '2025-03-01'
        })
        assert resp.status_code == 422
        data = resp.get_json()
        assert data['success'] is False

    def test_empty_strings(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '',
            'current_date': ''
        })
        assert resp.status_code == 422

    def test_non_json_content_type(self, client):
        resp = client.post('/api/calculate', data='not json', content_type='text/plain')
        assert resp.status_code == 415

    def test_null_values(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': None,
            'current_date': None
        })
        assert resp.status_code == 422

    def test_whitespace_dates(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '  1990-06-15  ',
            'current_date': '  2025-06-03  '
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['data']['years'] == 34

    def test_leap_year_date(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '2000-02-29',
            'current_date': '2025-03-01'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['data']['years'] == 25

    def test_future_current_date_allowed(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '1990-01-01',
            'current_date': '2030-01-01'
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['data']['years'] == 40

    def test_response_structure(self, client):
        resp = client.post('/api/calculate', json={
            'birth_date': '1990-01-01',
            'current_date': '2025-01-01'
        })
        data = resp.get_json()
        assert 'success' in data
        assert 'data' in data
        d = data['data']
        assert 'years' in d
        assert 'months' in d
        assert 'days' in d
        assert 'total_days' in d
        assert 'total_seconds' in d
        assert 'formatted' in d
        for key in ['years_months_days', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']:
            assert key in d['formatted']

class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        resp = client.get('/health')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'age-calculator'

    def test_health_has_version(self, client):
        resp = client.get('/health')
        data = resp.get_json()
        assert 'version' in data

class TestErrorHandlers:
    def test_404_returns_json(self, client):
        resp = client.get('/nonexistent')
        assert resp.status_code == 404
        data = resp.get_json()
        assert data['success'] is False

    def test_405_returns_json(self, client):
        resp = client.get('/api/calculate')
        assert resp.status_code == 405
        data = resp.get_json()
        assert data['success'] is False
