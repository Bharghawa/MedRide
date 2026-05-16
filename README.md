# MedRide 🚗

Non-emergency medical transport app — book an auto-rickshaw ride to your nearest hospital or clinic.

## Features

- **Real-time hospital search** — Fetches nearby hospitals/clinics based on your actual GPS location using free OpenStreetMap APIs (Photon, Nominatim, Overpass). No dummy data.
- **Multi-step booking flow** — Select ride type & urgency → special needs → choose destination hospital → book ride.
- **Driver & Patient roles** — Separate flows for patients (book rides) and drivers (accept/navigate rides).
- **Live location tracking** — Uses device GPS with reverse geocoding to show your current address.
- **SOS / Emergency help** — Quick access to emergency contacts and safety features.
- **Ride history** — View past rides and booking details.
- **Profile management** — Edit profile, switch roles (patient ↔ driver).
- **Light, accessible UI** — Clean white theme with Material Design 3 components.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation v7 (native-stack + bottom-tabs) |
| UI | React Native Paper (MD3) |
| State | Zustand |
| Auth/DB | Firebase (demo mode) |
| Location | expo-location |
| Hospital Data | OpenStreetMap (Photon → Nominatim → Overpass) |
| Maps | react-native-maps |

## Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Expo Go** app on your phone (Android/iOS) — [Download](https://expo.dev/go)

## Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Bharghawa/MedRide.git
cd MedRide

# 2. Install dependencies
npm install

# 3. Start Expo dev server
npx expo start

# 4. Scan the QR code with Expo Go app on your phone
```

### Run Options

```bash
# Local network (same WiFi)
npx expo start

# Tunnel mode (share with anyone over internet)
npx expo start --tunnel

# Android emulator
npx expo start --android

# iOS simulator (macOS only)
npx expo start --ios

# Web browser
npx expo start --web

# Clear cache if something breaks
npx expo start --clear
```

## Testing

```bash
# Unit tests
npm test

# E2E tests (Playwright, web)
npm run test:e2e
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── config/           # API configs (places.ts for hospital search)
├── navigation/       # App, Patient, Driver navigators
├── screens/
│   ├── auth/         # Login, Signup, Role selection
│   ├── patient/      # Home, Booking, History
│   ├── driver/       # Home, Ride requests, Navigation
│   └── shared/       # Profile, SOS
├── store/            # Zustand state management
└── theme/            # Colors and styling
```

## How Hospital Search Works

The app uses your device's real GPS coordinates and queries free OpenStreetMap-based APIs in order:

1. **Photon** (photon.komoot.io) — Fast POI search, returns hospitals sorted by proximity
2. **Nominatim** — OSM geocoding with bounding box filter
3. **Overpass** — Direct OSM database query via POST

No API keys needed. No dummy/hardcoded data. Every hospital shown is real and based on the user's actual location.

## License

MIT
