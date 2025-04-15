FROM python:3.12.9

WORKDIR /backend

COPY ./requirements.txt /backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code, to the folder /backend (the working directory)
COPY . /backend/

ENV PYTHONPATH=/backend

# Describe the port inside the container (just for documentation purposes)
EXPOSE 8000

# Start server from the /backend directory, and put it on port 8000, make sure if you changed here 8000 to change it in docker-compose.yml too
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
