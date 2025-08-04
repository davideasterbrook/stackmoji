# 🎮 Stackmoji

> **A daily emoji puzzle game built with modern React architecture and serverless AWS infrastructure**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-623CE4?style=flat&logo=terraform&logoColor=white)](https://terraform.io/)

Challenge yourself with a daily emoji puzzle! Guess which emojis are creating the shadow stack and track your streak. 

🔗 **Play now at [stackmoji.com](https://stackmoji.com)**

---

## ✨ Features

- 🆕 **New puzzle daily** - Fresh challenges every day at midnight UTC
- 🔥 **Streak tracking** - Maintain your solve streak across days  
- 🎯 **Three attempts** - Strategic gameplay with limited guesses
- 💡 **Smart hints** - Reveal emojis when you're stuck
- 🌍 **Multilingual** - Support for multiple languages
- 📱 **Responsive design** - Perfect on mobile and desktop
- 🎨 **Dark/Light themes** - Comfortable gaming experience
- 📤 **Social sharing** - Share your results with friends

---

## 🏗️ Architecture

### Frontend - Modern React Excellence
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 with custom theming
- **State Management**: Custom hooks with proper separation of concerns
- **Error Handling**: React Error Boundaries with graceful fallbacks
- **Performance**: Optimized with loading states and error recovery

#### Key Components & Hooks
```
src/
├── components/
│   ├── Game.tsx              # Main game orchestrator
│   ├── ErrorBoundary.tsx     # Global error handling
│   ├── LoadingSpinner.tsx    # Loading states
│   └── ...                   # Feature components
├── hooks/
│   ├── useGameState.ts       # Game state & persistence
│   ├── useGameLogic.ts       # Game mechanics & validation
│   ├── useStreak.ts          # Streak tracking
│   ├── useDailyGame.ts       # Daily puzzle loading
│   └── ...                   # Specialized hooks
└── utils/
    ├── cacheManager.ts       # Data caching strategy
    └── dateUtils.ts          # Date utilities
```

### Backend - Production-Grade Serverless
- **Runtime**: Python 3.12 on AWS Lambda
- **Framework**: AWS Lambda Powertools for enterprise features
- **Monitoring**: Comprehensive logging, metrics, and tracing
- **Error Handling**: Resilient with proper input validation
- **Font Processing**: Dynamic emoji font subsetting

#### Key Features
- ✅ **Comprehensive error handling** with AWS PowerTools
- ✅ **Input validation** and bounds checking
- ✅ **Metrics & monitoring** integration
- ✅ **Graceful degradation** - font failures don't break games
- ✅ **CloudFront cache invalidation** for instant updates

### Infrastructure as Code
- **Platform**: 100% AWS serverless architecture
- **IaC**: Terraform for reproducible deployments
- **CDN**: CloudFront with optimized caching
- **Storage**: S3 with proper security policies
- **Automation**: EventBridge for daily game generation

---

## 🚀 Development

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.12+ with pip
- **AWS CLI** configured with appropriate profile
- **Terraform** for infrastructure management

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

The development server runs at [http://localhost:3000](http://localhost:3000).

### Backend Development

```bash
# Activate Python virtual environment
source ~/venv/venv-3.12/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Build Lambda deployment package
cd scripts
./build_lambda.sh
```

### Infrastructure Deployment

```bash
# Frontend deployment
cd frontend
export AWS_PROFILE=your-aws-profile
./deploy.sh

# Backend infrastructure
cd backend/infra
terraform plan
terraform apply
```

---

## 🎯 Game Mechanics

1. **Daily Puzzle**: New emoji combinations generated at midnight UTC
2. **Shadow Display**: Emojis are shown as shadows/silhouettes  
3. **Three Attempts**: Players get exactly 3 guesses to solve
4. **Strategic Hints**: Reveal individual emojis when stuck (1 per round)
5. **Streak Tracking**: Maintain consecutive daily solve streaks
6. **Social Sharing**: Share results with emoji-based scoring

### Scoring System
- 🟩 **Correct emoji** (guessed without hints)
- 🟧 **Correct but hinted** (revealed using hint system)
- 🟥 **Wrong emoji** (incorrect guess)

---

## 🛠️ Technical Highlights

### Code Quality
- **TypeScript**: 100% typed with strict compiler settings
- **ESLint**: Zero warnings with Next.js recommended rules
- **Error Boundaries**: Graceful error handling throughout
- **Custom Hooks**: Clean separation of concerns and reusability
- **Performance**: Optimized re-renders and state management

### Infrastructure
- **Serverless**: Pay-per-use AWS Lambda architecture
- **CDN**: Global CloudFront distribution for fast loading
- **Monitoring**: CloudWatch metrics and structured logging
- **Security**: IAM roles with least privilege access
- **Automation**: Infrastructure as Code with Terraform

### Production Ready
- **Error Recovery**: Comprehensive error handling at all layers
- **Input Validation**: Server-side validation with bounds checking
- **Monitoring**: Structured logging and metrics collection
- **Caching**: Smart caching strategies for optimal performance
- **Security**: No exposed secrets, proper CORS configuration

---

## 📊 Performance & Monitoring

The application includes comprehensive observability:

- **Frontend**: Error boundaries with user-friendly fallbacks
- **Backend**: AWS Lambda Powertools for logging, metrics, and tracing
- **Infrastructure**: CloudWatch monitoring and alerting
- **User Experience**: Loading states and graceful error recovery

---

## 🤝 Contributing

This project showcases modern React architecture and serverless AWS patterns. The codebase demonstrates:

- **Clean Architecture**: Separation of concerns with custom hooks
- **Type Safety**: Comprehensive TypeScript integration
- **Error Handling**: Production-grade error recovery
- **Performance**: Optimized React patterns and AWS infrastructure
- **Security**: Best practices for serverless applications

---

## 📝 License

This project is open source and welcomes contributions! Please see the issues page for areas where you can help.

---

## 🎮 Play Stackmoji

Visit **[stackmoji.com](https://stackmoji.com)** to play the daily emoji puzzle!

Built with ❤️ using modern React architecture and AWS serverless infrastructure.

