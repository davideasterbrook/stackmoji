# Stackmoji Project

## Overview
Stackmoji is a multiplayer emoji guessing game with a Python backend and Next.js frontend. The game appears to involve guessing emojis from shadows or similar visual clues.

## Project Structure
- `frontend/` - Next.js React application with TypeScript
- `backend/` - Python Lambda functions and infrastructure
- `backend/infra/` - Terraform infrastructure as code
- `backend/app/` - Python application code and emoji data
- `backend/scripts/` - Build and deployment scripts

## Tech Stack
### Frontend
- **Framework**: Next.js 15.2.3 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint with Next.js config
- **Font**: NotoColorEmoji for emoji display

### Backend
- **Runtime**: Python 3.12 on AWS Lambda
- **Dependencies**: aws-lambda-powertools, fonttools, lxml
- **Infrastructure**: Terraform (AWS S3, CloudFront, Lambda, EventBridge)

## Development Commands

### Frontend Development
```bash
cd frontend
npm install
npm run dev     # Start development server on localhost:3000
npm run build   # Build for production
npm run lint    # Run ESLint
```

### Backend Development
```bash
# Activate Python virtual environment
source ~/venv/venv-3.12/bin/activate

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Build Lambda deployment package
cd scripts
./build_lambda.sh
```

### Deployment
```bash
# Frontend deployment (requires AWS profile setup)
cd frontend
export AWS_PROFILE=launchcraft-admin
./deploy.sh

# Backend infrastructure (Terraform)
cd backend/infra
terraform plan
terraform apply
```

## Key Files & Components

### Frontend Components
- `src/components/GameControls.tsx` - Game interaction controls
- `src/components/GuessHistory.tsx` - Player guess tracking
- `src/components/ShadowDisplay.tsx` - Emoji shadow rendering
- `src/components/SelectedEmojisDisplay.tsx` - Selected emoji display
- `src/app/page.tsx` - Main game page

### Backend Functions  
- `app/update_daily_game.py` - Lambda function for daily game updates
- `app/emoji_font.py` - Emoji font handling utilities
- `app/base_emojis.json` - Base emoji dataset
- `app/gen_emoji_list.py` - Emoji list generation script

### Infrastructure
- Terraform manages AWS resources (S3, CloudFront, Lambda, EventBridge)
- Frontend deployed to S3 with CloudFront CDN
- Backend runs as scheduled Lambda functions

## Testing & Quality
- Run `npm run lint` for frontend code quality checks
- No specific test commands found - check for test files if implementing tests

## Deployment Architecture
- Frontend: Static site on S3 + CloudFront
- Backend: AWS Lambda functions with EventBridge scheduling
- Infrastructure: Managed via Terraform
- AWS Profile: `launchcraft-admin` for deployments

## Notes
- Project uses emoji font files for consistent cross-platform display
- Daily game updates appear to be automated via Lambda scheduling
- Frontend builds to static files in `out/` directory for S3 deployment