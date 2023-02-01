FROM python:3.9-slim

WORKDIR /app

COPY ./requirement.txt /app/requirement.txt

RUN apt-get update \
    && apt-get install gcc libpq-dev lsb-release curl wget gnupg -y \
    && apt-get clean

RUN pip install -r /app/requirement.txt \
    && rm -rf /root/.cache/pip

COPY . /app/
WORKDIR ./app

CMD python cloudamqp.py