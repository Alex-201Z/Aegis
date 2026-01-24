# Aegis

> **"Un pare-feu mental pour ta vie numerique."**
> *Personal cybersecurity augmented by AI - Your Digital Sentinel*

Aegis is a modern cybersecurity application that makes personal security **understandable, proactive, and engaging**. It monitors your digital footprint, alerts you to data breaches, and guides you through securing your accounts with AI-powered explanations.

## Features

### Core Functionality (MVP)

- **Data Breach Surveillance**: Monitor your emails and usernames across known data breaches
- **Security Score**: Personal security rating (0-100) based on passwords, MFA, exposure, and hygiene
- **AI Pedagogical Assistant**: Get security concepts explained in clear, non-technical language
- **Security Checklist**: Comprehensive checklist to improve your security posture
- **Real-time Alerts**: WebSocket-powered instant notifications for new breaches

### Gamification

- **Rank System**: Progress from Novice to Architect as you improve your security
- **XP Rewards**: Earn experience points for completing security actions
- **Achievement Tracking**: Track your security improvements over time

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.io for WebSocket communication
- **Security**: Helmet, bcrypt, JWT authentication
- **Validation**: Zod schema validation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom cyber theme
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React

### Shared
- **Types**: Shared TypeScript definitions
- **Constants**: Common configuration values
- **Utilities**: Shared helper functions

## Project Structure

```
aegis/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── data/           # In-memory data store
│   │   ├── middleware/     # Auth, rate limiting, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities (logger)
│   │   ├── websocket/      # Socket.io setup
│   │   └── index.ts        # Entry point
│   └── package.json
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # API client, socket utils
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── shared/                 # Shared TypeScript code
│   └── src/
│       ├── types.ts        # Type definitions
│       ├── constants.ts    # Configuration constants
│       └── utils.ts        # Utility functions
└── package.json            # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aegis

# Install all dependencies
npm install

# Build shared package
npm run build --workspace=shared
```

### Development

```bash
# Start both backend and frontend in development mode
npm run dev

# Or start them separately:
npm run dev:backend  # Backend on http://localhost:4000
npm run dev:frontend # Frontend on http://localhost:3000
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get user profile with security score
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `GET /api/user/progress` - Get gamification progress

### Security
- `GET /api/security/score` - Get detailed security score
- `GET /api/security/breaches` - List known breaches
- `GET /api/security/alerts` - Get user's breach alerts
- `PUT /api/security/alerts/:id/read` - Mark alert as read
- `PUT /api/security/alerts/:id/resolve` - Resolve an alert
- `GET /api/security/actions` - Get recommended actions
- `PUT /api/security/actions/:id/complete` - Complete an action
- `GET /api/security/checklist` - Get security checklist
- `PUT /api/security/checklist/:id` - Toggle checklist item

### Assets
- `GET /api/assets` - List monitored assets
- `POST /api/assets` - Add new asset to monitor
- `POST /api/assets/check` - Re-check asset for breaches
- `DELETE /api/assets/:id` - Remove monitored asset

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/explain` - Get explanation of security topic
- `GET /api/ai/tips` - Get random security tips

## WebSocket Events

- `breach_alert` - New breach detected for user's asset
- `score_update` - Security score has changed
- `rank_up` - User reached new rank
- `badge_unlocked` - User earned a badge

## Security Score Calculation

The security score (0-100) is calculated from four components:

| Component | Weight | Description |
|-----------|--------|-------------|
| Passwords | 35% | Based on breach exposure and password changes |
| MFA | 30% | Two-factor authentication adoption |
| Exposure | 25% | Number of breached assets and unresolved alerts |
| Hygiene | 10% | Security checklist completion |

## Rank System

| Rank | XP Required | Color |
|------|-------------|-------|
| Novice | 0 | Gray |
| Defender | 500 | Green |
| Guardian | 1,500 | Blue |
| Sentinel | 3,500 | Purple |
| Architect | 7,000 | Gold |

## Roadmap

- [ ] Integration with HaveIBeenPwned API
- [ ] Dark Web monitoring
- [ ] Gaming platform integration (Steam, Epic, Riot)
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Password manager integration
- [ ] Browser extension
- [ ] Premium features

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT License - see LICENSE file for details.

---

**Aegis**: *La cybersecurite personnelle qui te respecte assez pour t'expliquer.*
