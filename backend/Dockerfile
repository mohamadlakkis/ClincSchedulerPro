FROM python:3.9-slim

WORKDIR /backend

# Copy and install requirements
COPY ./requirements.txt /backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . /backend/

# Expose the port for FastAPI (default is 8000)
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
