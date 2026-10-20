FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .

# Cloud Run sets PORT; default to 8080 for local docker run.
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
