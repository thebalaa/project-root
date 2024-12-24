# Base Dockerfile for AI/ML microservice

FROM python:3.9-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy requirement files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY . .

# Expose the AI service port
EXPOSE 5000

# Default command - run the AI microservice
CMD [ "python", "microservices/ai_service.py" ]
