ifeq ($(OS),Windows_NT)
    VENV = venv
    PYTHON = $(VENV)\Scripts\python.exe
    PIP = $(VENV)\Scripts\pip.exe
    ACTIVATE = $(VENV)\Scripts\activate
else
    VENV = venv
    PYTHON = $(VENV)/bin/python
    PIP = $(VENV)/bin/pip
    ACTIVATE = $(VENV)/bin/activate
endif

.PHONY: install install-back install-front build-front dev-front run help

help:
	@echo "Comandos disponiveis:"
	@echo "  make install       - Instala as dependencias do backend (venv) e frontend (npm)"
	@echo "  make build-front   - Compila o frontend React (produção)"
	@echo "  make dev-front     - Inicia o servidor de desenvolvimento do frontend (Vite)"
	@echo "  make run           - Inicia o backend Flask (que serve o frontend compilado)"

$(ACTIVATE):
	python -m venv $(VENV)

install-back: $(ACTIVATE)
	$(PIP) install -r backend/requirements.txt

install-front:
	npm --prefix frontend_react install

install: install-back install-front

build-front:
	npm --prefix frontend_react run build

dev-front:
	npm --prefix frontend_react run dev

run: install-back
	$(PYTHON) backend/app.py

