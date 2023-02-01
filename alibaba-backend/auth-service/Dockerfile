FROM python:3.9-slim

WORKDIR /app

COPY ./requirement.txt /app/requirement.txt

RUN apt-get update \
    && apt-get install gcc libpq-dev -y \
    && apt-get clean

RUN pip install -r /app/requirement.txt \
    && rm -rf /root/.cache/pip

COPY . /app/

CMD uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'