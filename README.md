# Basha Biryani - Restaurant Management System

A comprehensive restaurant management system for Basha Biryani with separate admin and customer interfaces.

## Project Structure

This repository contains the **Admin Panel** for managing restaurant operations.

## Features

### Admin Panel
- 📊 Dashboard with analytics and metrics
- 👥 User & Customer Management
- 🍽️ Menu Management (items, categories, pricing)
- 📦 Order Tracking & Management
- 💳 Payment Management
- 🎁 Offers & Promotions
- 📝 Content Management System (CMS)
- 💬 Customer Inquiries
- ⚙️ Settings (GST, Delivery Charges, Contact Details)

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **UI Framework:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Icons:** Lucide React, FontAwesome
- **Form Handling:** React Hook Form + Zod
- **Charts:** Recharts

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

- **Dev Server:** `npm run dev` - Runs on http://localhost:5173
- **Type Check:** `npm run typecheck`
- **Lint:** `npm run lint`

## Default Admin Credentials

```
Email: admin@srfoodkraft.com
Password: admin123
```

## PWA Support

This application is a Progressive Web App (PWA) and can be installed on mobile devices and desktops for an app-like experience.

## Database Schema

Database migrations are located in `/supabase/migrations/`:
- CMS tables (gallery, banners, content pages, FAQs, blog)
- Menu items and categories
- Site settings and configurations
- Restaurant settings and notifications
- Customer data

## Project Status

**Current Phase:** Admin Panel Development
**Next Phase:** Customer-facing application

## License

Private - All Rights Reserved
