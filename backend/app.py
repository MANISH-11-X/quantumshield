"""
app.py
Main entry point for the QuantumShield Flask backend server.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.api import api_bp, load_system_artifacts

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Load artifacts on startup
    with app.app_context():
        load_system_artifacts()

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({'error': 'Resource not found', 'status': 404}), 404

    @app.errorhandler(500)
    def handle_internal_error(e):
        return jsonify({'error': 'An internal server error occurred', 'status': 500}), 500

    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({'error': 'Bad request', 'status': 400}), 400

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[QuantumShield] Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
