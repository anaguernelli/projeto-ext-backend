import os

def _load_env():
    # Caminho absoluto para a raiz do projeto (onde o .env está)
    factory_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(factory_dir))
    project_dir = os.path.dirname(backend_dir)
    env_path = os.path.join(project_dir, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and not os.environ.get(k):
                        os.environ[k] = v

_load_env()

from flask import Flask
from flask_cors import CORS
from backend.infra.db import init_db
from backend.infra.server.routes import bp as routes_bp

def bootstrap_app():
    """Inicializa a aplicação Flask puro como API REST, banco de dados e rotas"""
    # Caminhos absolutos para servir o frontend
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    project_dir = os.path.dirname(backend_dir)
    dist_dir = os.path.join(project_dir, "frontend_react", "dist")

    app = Flask(__name__, template_folder=dist_dir, static_folder=dist_dir, static_url_path="")
    app.secret_key = os.environ.get("SECRET_KEY", "pizzaria404_dev_secret_key_secure_32bytes")
    CORS(app)
    # Registra as rotas modularizadas
    app.register_blueprint(routes_bp)

    @app.errorhandler(404)
    def page_not_found(e):
        from flask import request, jsonify, render_template
        if request.path.startswith("/api/"):
            return jsonify({"ok": False, "erro": "Not Found"}), 404
        return render_template("index.html")

    # Executa a inicialização do banco de dados (tabelas)
    init_db()

    # Inicia o thread de atualização automática de status dos pedidos
    from backend.infra.background.status_updater import start_background_updater
    start_background_updater()
    return app
