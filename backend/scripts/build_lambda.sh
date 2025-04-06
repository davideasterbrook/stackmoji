#!/bin/bash

# Set working directory to the script's location
cd "$(dirname "$0")"

# Clean up any existing build artifacts
echo
echo "Cleaning up any existing build artifacts"
rm -rf build
rm -rf ../infra/lambda_function.zip

# Create a temporary build directory
echo
echo "Creating a temporary build directory"
mkdir -p build

# Copy the Lambda function
echo
echo "Copying the Lambda function"
cp ../app/update_daily_game.py build/
echo "Copying the emoji list"
cp ../app/base_emojis.json build/

# Install dependencies from requirements.txt
echo
echo "Installing dependencies from requirements.txt"
pip install -r ../requirements.txt -t build/

# Create the zip file with everything
echo
echo "Creating the zip file with everything"
cd build
zip -r ../../infra/lambda_function.zip *

# Clean up
echo
echo "Cleaning up"
cd ..
rm -rf build 