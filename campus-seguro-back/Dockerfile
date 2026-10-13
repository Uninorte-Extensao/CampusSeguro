FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Usa a porta injetada pelo host ($PORT, ex.: Render) e cai para 8000 localmente.
# Forma shell para que ${PORT} seja expandido em tempo de execução.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}