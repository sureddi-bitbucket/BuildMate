#!/bin/bash

echo "========================================"
echo "BuildMate Standalone - Quick Setup"
echo "========================================"
echo

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies!"
    exit 1
fi

echo
echo "Installing frontend dependencies..."
cd public
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies!"
    exit 1
fi

echo
echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error building frontend!"
    exit 1
fi

cd ..

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "To start the application, run:"
echo "  npm start"
echo
echo "The application will be available at:"
echo "  http://localhost:5038"
echo
echo "Demo accounts:"
echo "  Distributor: distributor@buildmate.com / distributor123"
echo "  Consumer: consumer@buildmate.com / consumer123"
echo

