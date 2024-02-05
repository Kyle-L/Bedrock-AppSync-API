#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${RED}Error: npm is not installed.${NC}" >&2
  exit 1
fi

# Check if git is installed
if ! [ -x "$(command -v git)" ]; then
  echo -e "${RED}Error: git is not installed.${NC}" >&2
  exit 1
fi

echo -e "${GREEN}Setting up the project...${NC}"

# Navigate to the top of the git directory
TOP_LEVEL=$(git rev-parse --show-toplevel)

# Install infrastructure dependencies
echo -e "${BLUE}Installing infrastructure dependencies...${NC}"
cd $TOP_LEVEL/infrastructure && npm install
echo -e "${GREEN}Finished setting the infrastructure dependencies.${NC}"

# Copy .env.example to .env
echo -e "${BLUE}Copying .env.example to .env...${NC}"
cp $TOP_LEVEL/infrastructure/.env.example $TOP_LEVEL/infrastructure/.env
echo -e "${GREEN}Finished copying .env.example to .env.${NC}"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd $TOP_LEVEL/frontend && npm install
echo -e "${GREEN}Finished setting the frontend dependencies.${NC}"

# Copy .env.example to .env
echo -e "${BLUE}Copying .env.example to .env...${NC}"
cp $TOP_LEVEL/frontend/.env.example $TOP_LEVEL/frontend/.env
echo -e "${GREEN}Finished copying .env.example to .env.${NC}"