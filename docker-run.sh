#!/bin/bash

echo "🐳 Building Docker Image..."
docker build -t dcsc-attendance .

echo ""
echo "🚀 Starting DCSC Attendance Dashboard..."
echo ""
echo "🔐 Login Credentials:"
echo "   Username: admin"
echo "   Password: testpass123"
echo ""
echo "📍 Access at: http://localhost:8080"
echo ""

docker run -p 8080:8080 \
  -e BASIC_AUTH_USERNAME=admin \
  -e BASIC_AUTH_PASSWORD=testpass123 \
  -e SECRET_KEY=dev-secret-key \
  dcsc-attendance

