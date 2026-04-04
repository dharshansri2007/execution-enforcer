# 1. Use a lightweight Python base image
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the requirements file and install the tools
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy ALL your files into the container
COPY . .

# 5. HARDCODE THE PORT TO 8080
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
