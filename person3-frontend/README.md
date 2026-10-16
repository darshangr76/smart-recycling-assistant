# Smart Recycle AI — Intelligent Waste & Sustainability Platform ♻️🌱

> A hackathon-ready, production-grade web application that helps individuals and organizations identify waste materials using AI computer vision, learn precise disposal guidelines, locate nearby certified recycling depots, track avoided greenhouse gas emissions, and earn gamified rewards for sustainable habits.

---

## 🌟 Features & Highlights

1. **AI Waste Scanner (Visual Classifier)**
   - Upload images via drag-and-drop or file picker.
   - Live camera capture on supported devices (phones and webcams).
   - High-confidence classification across 9 waste categories:
     - Plastic (#1 PET, #2 HDPE, #4 LDPE, #5 PP)
     - Paper & Cardboard (Shipping boxes, Tetra Paks, Soiled cartons)
     - Glass (Bottles, Jars, Borosilicate warning)
     - Metal (Aluminum, Steel/Tin cans, Aerosols)
     - Organic / Compostable (Peels, Coffee grounds, Food scraps)
     - Electronic Waste (Phones, Laptops, Cables, Chargers)
     - Batteries (Li-ion, Alkaline, 9V, Button cells)
     - General / Non-recyclable waste
     - Potentially hazardous household waste (CFL bulbs, Oil paints)
   - Step-by-step preparation checklist (e.g. rinse, compress, replace cap).
   - High-hazard safety badges (thermal runaway warnings for lithium batteries, mercury vapor warnings for CFLs).
   - Instant Demo Presets for judges and users without sample photos.
   - Manual category override if classification is ambiguous.

2. **Personalized Sustainability Dashboard**
   - KPI metric cards: Total Items Scanned, Landfill Diverted (kg), Avoided CO₂e (kg), and Sorting Accuracy (%).
   - Interactive Recharts Bar Chart showing weekly activity over the last 7 days.
   - Recharts Pie Chart visualizing waste stream distribution.
   - Chronological recent scan history.
   - Daily eco-tip & streak tracking widget.

3. **Encyclopedic Recycling & Sorting Guide**
   - Searchable directory of 30+ everyday items.
   - Category filtering pills with instant search indexing.
   - Detailed modal cards highlighting preparation steps, destination streams, common contamination mistakes, landfill decomposition rates, and sustainable alternatives.
   - Configurable municipality notices (rules vary by city).

4. **Nearby Recycling Centers & Depots**
   - Interactive OpenStreetMap integration powered by Leaflet & React-Leaflet.
   - Geolocation GPS detection with fallback city presets (San Francisco, New York, Seattle, London, Berlin, Bengaluru, Tokyo).
   - Real-time Haversine proximity calculations (km).
   - Filters for e-waste, hazardous batteries, composting hubs, and dry recyclables.
   - One-click Google Maps turn-by-turn navigation links.

5. **Environmental Impact & Carbon Accounting**
   - Peer-reviewed life-cycle analysis (LCA) modeling using **EPA WARM v15** and **UK DEFRA** emission factors.
   - Real-world equivalency metrics: urban trees planted, car miles avoided, water conserved, and smartphone battery charges.
   - 5-month cumulative trajectory area chart.
   - Transparent methodology disclosure modal.

6. **Gamification & Rewards Engine**
   - 15 points per scan, 20 points per confirmed sorted action, 5 points per guide read.
   - Duplicate event prevention ensures honest reward accrual.
   - Daily and weekly challenges with progress bars and claimable bonus points.
   - Interactive celebratory confetti animations.
   - Sustainability badge showcase (Eco Initiate, Polymer Crusher, Battery Guardian, Silicon Savior, Soil Alchemist, Consistency Champion).

7. **Database & Authentication Ready**
   - Supabase client integration ready for cloud authentication and RLS (Row Level Security).
   - Complete PostgreSQL SQL script provided in `supabase/schema.sql`.
   - Seamless offline fallback: operates 100% out of the box using `localStorage` without requiring any cloud keys to test.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Eco-Tech Design System
- **Icons**: Lucide React
- **Mapping**: OpenStreetMap + Leaflet + React-Leaflet
- **Data Visualization**: Recharts
- **Celebration Effects**: Canvas Confetti
- **Backend / Database (Optional)**: Supabase JS + PostgreSQL RLS
- **State & Storage**: React Context + Browser LocalStorage persistence

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js LTS (v18, v20, or v22+)
- npm or pnpm or yarn

### 2. Installation
```bash
# Clone or navigate to the project directory
cd smart-recycle-ai

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
# Optional: External AI Waste Classification endpoint (e.g. FastAPI / Flask / Node)
VITE_API_BASE_URL=

# Optional: Supabase credentials for cloud authentication & sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
> **Note**: Both variables are optional. When left empty, the application runs entirely in high-fidelity demo simulation mode with offline storage!

### 4. Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🤖 Connecting Your Own AI Classification Service

The AI scanner is designed to communicate with any external backend (FastAPI, Flask, Express, Django, etc.) that accepts `multipart/form-data`:

### Request
```http
POST /api/classify-waste
Content-Type: multipart/form-data

image: <binary file>
```

### Expected JSON Response
```json
{
  "itemName": "PET Beverage Bottle",
  "category": "Plastic",
  "confidence": 0.94,
  "recyclable": true,
  "instructions": [
    "Empty remaining liquid completely",
    "Rinse with cold water",
    "Crush bottle to save volume",
    "Screw plastic cap back on"
  ],
  "disposalMethod": "Curbside blue bin or bottle deposit return kiosk",
  "specialHandling": false,
  "hazardLevel": "none",
  "environmentalTip": "Recycling PET saves 1.5 kg CO2e per kg.",
  "estimatedWeightKg": 0.035,
  "carbonAvoidedKg": 0.052
}
```

You can configure this endpoint in **Settings** &rarr; **Custom AI Vision Endpoint**, or by setting `VITE_API_BASE_URL` in your `.env`.

---

## 🗄️ Supabase Database Setup

To enable cloud authentication and sync across devices:
1. Create a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the provided script located in `supabase/schema.sql`.
4. Copy your project URL and anon public key from **Project Settings** &rarr; **API**.
5. Paste them into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## 🏷️ Live vs Demo Feature Matrix

| Feature | In Demo Mode | In Live Mode |
|---|---|---|
| **AI Waste Scanner** | Deterministic simulation presets & instant sample cards | Calls `POST /api/classify-waste` with timeout & retry |
| **Environmental Metrics** | Stored in `localStorage` with EPA/DEFRA formulas | Synced to Supabase `waste_scans` table |
| **Recycling Guide** | Complete built-in database of 30+ materials | Complete built-in database of 30+ materials |
| **Recycling Centers** | OpenStreetMap Leaflet map with verified sample hubs in SF, NY, Seattle, London, Berlin, Bengaluru, Tokyo | Map displays custom database records |
| **Gamification & Badges** | Persisted in `localStorage` with anti-duplicate logic | Can sync with Supabase `user_rewards` |
| **User Authentication** | Instant Guest Profile (Alex Rivera) | Supabase Magic Link OTP / Email Authentication |

---

## 🌿 License
MIT License. Built for sustainability hackathons and eco-conscious communities worldwide.
