# Safarnama - Frontend Navigation Map (Phase 0/1)

This document provides a directory map of all components, files, and layouts scaffolded in this initial phase. Use this reference to quickly jump to the right file whenever you need to adjust routes, modify the UI, or change theme tokens in the future.

## 🎯 Config & Entrypoints
*   **`package.json`**: Lists standard dependencies (`react-router-dom`, `lucide-react`, Tailwind + Plugins).
*   **`tailwind.config.ts`**: Contains Safarnama theme branding elements. Modify this if you wish to adjust the core color classes (Amber, Gold, Blue palette rules).
*   **`src/styles.css`**: Defines CSS root variables (`--background`, `--primary`, etc.) for automatic light/dark mode UI swaps.
*   **`src/main.tsx`**: Initial React mount that binds `ThemeProvider`, `AuthProvider`, and `BrowserRouter` over your entire app tree.
*   **`src/App.tsx`**: The exact routing map. If you need to add brand-new URLs, declare those routes here.

## 🔒 State Providers & Protectors
*   **`src/providers/auth-provider.tsx`**: Currently a mock Context implementation controlling session login/logout and admin privilege flags. Next phase swaps this for Supabase hook integration.
*   **`src/providers/theme-provider.tsx`**: Enforces system or forced dark/light theme switching on the root DOM.
*   **`src/components/layout/protected-route.tsx`**: The gateway wrapper. Blocks unsigned-in users from viewing private dashboard pages, redirecting them to `/`.

## 🧩 Layouts & Navigation
*   **`src/components/layout/app-layout.tsx`**: The master scaffold that sets the application container and mounts the Navbar for active dashboard users.
*   **`src/components/layout/app-nav.tsx`**: Controls everything visible on your headers (the Safarnama Logo, theme toggle switch, desktop navbar, and the sticky mobile bottom application bar).
*   **`src/components/layout/page-shell.tsx`**: The consistent page template wrapper (provides standard main `<header>` container layouts used inside views).

## 🖥 React Views (Pages)
*   **`src/pages/welcome.tsx`** (`/`): The public landing screen (handles gradients and generic access).
*   **`src/pages/dashboard.tsx`** (`/dashboard`): Primary command hub showing available trips.
*   **`src/pages/add-trip.tsx`** (`/add-trip`): Setup screen for creating a trip.
*   **`src/pages/edit-trip.tsx`** (`/edit-trip/:id`): Edit bounds for existing trip definitions.
*   **`src/pages/trip-detail.tsx`** (`/trip/:id`): Central dashboard for an active trip.
*   **`src/pages/trip-itinerary.tsx`** (`/trip/:id/itinerary`): The day-by-day planner template.
*   **`src/pages/trip-checklist.tsx`** (`/trip/:id/checklist`): The packing utilities layout.
*   **`src/pages/trip-journal.tsx`** (`/trip/:id/journal`): Memory log screen.
*   **`src/pages/public-share.tsx`** (`/share/:shareId`): The isolated read-only route enabling users to view external shared travel instances safely.
*   **`src/pages/admin-analytics.tsx`** (`/admin/analytics`): Protected platform statistics panel (admin-only).
*   **`src/pages/profile.tsx`** (`/profile`): User identity preferences pane.
*   **`src/pages/settings.tsx`** (`/settings`): Application configuration screen.
*   **`src/pages/not-found.tsx`** (`*`): The default broken link (404) catch-screen.

## 🧱 UI Building Primitives
*   **`src/components/ui/button.tsx`**: Root button primitive enforcing brand consistency.
*   **`src/components/ui/card.tsx`**: Standard card wrappers used for dashboard item groups.

## 📝 Types & Mocks
*   **`src/types.ts`**: Contains foundational TypeScript declarations detailing app domains (Trip, ItineraryItem, User, etc.). 
*   **`src/data/mock.ts`**: The mocked JSON-equivalent constants supplying sample data for the mock application state.
