# PRN Frontend

Modern React + TypeScript + Tailwind CSS frontend application with component-based architecture.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
d:\PRN-FE\
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components (Button, Header, etc.)
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   ├── styles/             # Global styles
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── assets/             # Static assets
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Public static assets
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Styling Approach

This project uses a **hybrid approach**:

- **Tailwind CSS** for utility-first styling
- **Component-specific CSS files** for complex styles, animations, and pseudo-elements

See [STYLING_GUIDE.md](./STYLING_GUIDE.md) for detailed guidelines.

## 🧩 Component Pattern

Each component follows a consistent structure:

```
ComponentName/
├── ComponentName.tsx        # Component logic
├── ComponentName.css        # Component styles
└── index.ts                 # Clean exports
```

## 🛠️ Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Utilities**: clsx for class management

## 📖 Path Aliases

Import using clean path aliases:

```tsx
import { Button } from '@components/common/Button'
import { utils } from '@utils/helpers'
```

Available aliases:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@styles/*` → `src/styles/*`
- `@utils/*` → `src/utils/*`
- `@hooks/*` → `src/hooks/*`
- `@types/*` → `src/types/*`
- `@assets/*` → `src/assets/*`

## 🎯 Development

The development server runs on `http://localhost:5173` with hot module replacement (HMR) enabled.

## 📝 Code Style

- Use TypeScript for type safety
- Follow component-based architecture
- Use functional components with hooks
- Prefer composition over inheritance
- Write self-documenting code

## 📚 Documentation

- [Styling Guide](./STYLING_GUIDE.md) - Comprehensive styling guidelines and best practices

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

Private project
