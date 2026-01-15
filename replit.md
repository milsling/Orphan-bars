# Orphan Bars

## Overview

Orphan Bars is a social platform designed for lyricists to share, discover, and interact with one-liners, punchlines, and entendres. It aims to foster a community around lyrical creativity, allowing users to post their bars with categories and tags, browse content from others, and manage their profiles. The project envisions a vibrant, hip-hop themed online space that caters to wordsmiths, offering unique features like a proof-of-origin system for lyrical works, an XP and leveling system for engagement, and rich social interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query for server state, React Context for global UI state.
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style variant).
- **UI/UX**: Hip-hop themed design with customizable typography, a dark purple/charcoal color scheme, animated page transitions (Framer Motion), skeleton loading, and PWA features like pull-to-refresh and swipe gestures.
- **Build Tool**: Vite.

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints.
- **Session Management**: Express-session.

### Authentication
- **Strategy**: Passport.js with local strategy.
- **Security**: scrypt hashing for passwords, server-side sessions with secure cookies.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts`, shared between client and server.
- **Key Tables**: `users`, `bars`, `bookmarks`, `push_subscriptions`, `friendships`, `direct_messages`, `user_achievements`.

### File Storage
- **Service**: Google Cloud Storage via Replit Object Storage integration.
- **Mechanism**: Presigned URLs for direct client uploads.

### Core Features
- **Progressive Web App (PWA)**: Includes features like full-text search, bookmarks, offline mode via service worker, push notifications, and home screen integration.
- **Social Features**: Comprehensive friends system, direct messaging with real-time updates via WebSockets, online presence indicators, and an achievement system with custom achievement creation capabilities.
- **Gamification**: XP and leveling system based on user activity, offering level-based perks.
- **Proof-of-Origin System**: Unique IDs, immutable timestamps, and SHA256 hashes for each bar to ensure authenticity and track lineage through an adoption system. Includes shareable proof images.
- **Beat/Instrumental Embedding**: Allows users to link beats from YouTube, SoundCloud, Spotify, and Audiomack to their bars, with real-time URL validation and embed player support.
- **Admin Console**: Site owner-only console with SQL query runner (SELECT only) and quick actions for site management.
- **Real-time Communication**: WebSocket implementation for direct messaging with heartbeats, auto-reconnect, and optimistic UI updates.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe database queries.

### Cloud Services
- **Google Cloud Storage**: For file uploads, integrated via Replit Object Storage.
- **Replit Sidecar**: For GCS authentication token management.

### Key NPM Packages
- **@tanstack/react-query**: Server state management.
- **drizzle-orm** / **drizzle-kit**: ORM and migrations.
- **passport** / **passport-local**: Authentication.
- **@uppy/core** / **@uppy/aws-s3**: File upload handling.
- **zod**: Schema validation.
- **date-fns**: Date utilities.

### Fonts
- **Google Fonts**: Syne, UnifrakturMaguntia, Anton, Oswald, JetBrains Mono for user-switchable display fonts.