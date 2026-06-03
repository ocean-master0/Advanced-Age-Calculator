import os

class BaseConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24).hex())
    DEBUG = False
    TESTING = False

class DevelopmentConfig(BaseConfig):
    DEBUG = True

class TestingConfig(BaseConfig):
    TESTING = True
    SECRET_KEY = 'test-secret-key'

class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False

    @property
    def SECRET_KEY(self):
        key = os.environ.get('SECRET_KEY')
        if not key:
            raise ValueError('SECRET_KEY environment variable is required in production')
        return key

config_map = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config(name=None):
    cfg_class = config_map.get(name, DevelopmentConfig)
    return cfg_class()
