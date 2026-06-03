import os
import logging
from datetime import datetime
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.config import get_config
from app.utils.response import make_error_response

limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])

def create_app(config_name=None):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    cfg = get_config(config_name or os.environ.get('FLASK_ENV', 'default'))
    app.config.from_object(cfg)
    app.secret_key = cfg.SECRET_KEY

    limiter.init_app(app)

    configure_logging(app)
    register_template_filters(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_health_endpoint(app)

    return app

def register_template_filters(app):
    @app.template_filter('strftime')
    def _strftime(value, fmt='%Y%m%d%H%M'):
        return datetime.utcnow().strftime(fmt)

def configure_logging(app):
    level = logging.DEBUG if app.debug else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    app.logger.setLevel(level)

def register_blueprints(app):
    from app.routes.main import main_bp
    from app.routes.api import api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return make_error_response(str(error), 400)

    @app.errorhandler(404)
    def not_found(error):
        return make_error_response('Resource not found', 404)

    @app.errorhandler(405)
    def method_not_allowed(error):
        return make_error_response('Method not allowed', 405)

    @app.errorhandler(429)
    def ratelimit_error(error):
        return make_error_response('Too many requests. Please slow down.', 429)

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error('Internal server error', exc_info=True)
        return make_error_response('An unexpected error occurred', 500)

def register_health_endpoint(app):
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'age-calculator', 'version': '2.0.0'}, 200
