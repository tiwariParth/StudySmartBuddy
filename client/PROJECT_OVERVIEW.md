# StudySmartBuddy Client Overview

## Project Structure

- `/src/app`: Next.js App Router structure
  - `page.tsx`: Main landing page component
  - `layout.tsx`: Root layout that wraps all pages
- `next.config.ts`: Next.js configuration
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `postcss.config.mjs`: PostCSS configuration for Tailwind
- `eslint.config.mjs`: ESLint flat configuration

## Tech Stack

- **Framework**: Next.js 15.3
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Linting**: ESLint 9
- **Package Manager**: pnpm

## Key Features of the Setup

1. **App Router**: Using Next.js' modern App Router architecture
2. **TypeScript**: Full type safety throughout the application
3. **Tailwind CSS**: Utility-first CSS framework for styling
4. **ESLint**: Modern flat config format for code quality
5. **React 19**: Latest React version with concurrent features

## Getting Started

Run the development server:
```bash
cd /home/parth/StudySmartBuddy/client
pnpm install
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
