# BioAttend - School Attendance System Using Biometric

A modern, full-featured school attendance management system with biometric authentication support using the **WebAuthn / FIDO2 API** (fingerprint, face ID, security keys).

![BioAttend Dashboard](./docs/screenshot.png)

## Features

### Core Features
- **Biometric Authentication** via WebAuthn API (fingerprint, Face ID, Windows Hello)
- **Real-time Attendance Tracking** with scan simulation for demo environments
- **Student Management** (CRUD operations, biometric registration status)
- **Attendance Reports** with charts, per-student stats, and low-attendance alerts
- **Manual Override** (teacher can mark present/absent/late manually)
- **Multi-class Support** with class-based filtering

### Authentication
- Role-based login (Administrator, Teacher)
- Session management

### Dashboard
- Today's attendance overview (present, absent, late counts)
- Weekly attendance bar chart
- Biometric registration status
- Recent activity log

### Biometric Scanner
- Simulated scanner (works in any browser — no hardware needed for demo)
- Real WebAuthn integration for production use
- 95%+ confidence threshold simulation

### Reports
- Per-student attendance rates
- Class-wide comparison charts
- Low attendance alerts (configurable threshold)
- CSV export button

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Biometric | WebAuthn API (FIDO2) |
| Styling | Inline styles + CSS custom properties |
| State | React hooks (useState, useMemo) |
| Auth (demo) | In-memory |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/school-attendance-biometric.git
cd school-attendance-biometric
npm install
npm run dev
```

Open http://localhost:5173

### Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Administrator | admin | admin123 |
| Teacher | teacher | teacher123 |

## Project Structure

```
src/
  pages/
    Login.jsx          # Authentication page
    Dashboard.jsx      # Overview with charts
    Attendance.jsx     # Biometric scanning + marking
    Students.jsx       # Student CRUD management
    Reports.jsx        # Analytics and exports
    Settings.jsx       # System configuration
  components/
    Sidebar.jsx        # Navigation sidebar
  services/
    biometricService.js  # WebAuthn wrapper
  utils/
    mockData.js        # Sample data generator
  context/
    AppContext.js      # Global state
```

## Biometric Integration

The system supports two modes:

### 1. Demo/Simulation Mode (default)
Works in any environment. Simulates a 95% success rate fingerprint scan with realistic timing delays.

### 2. WebAuthn Mode (production)
Uses the browser's native `navigator.credentials` API:
- **iOS/macOS**: Touch ID or Face ID
- **Windows**: Windows Hello (fingerprint or face)
- **Android**: Fingerprint sensor
- **Any device**: FIDO2 security key (YubiKey, etc.)

To enable real biometric scanning, change the scanner mode in **Settings** to "WebAuthn / FIDO2".

### Backend Integration (for production)
The included `biometricService.js` stores credential IDs in localStorage for demo purposes. In production:
1. Send `challenge` from your backend
2. Verify the signed response server-side
3. Store credential IDs in your database (PostgreSQL, MongoDB, etc.)

Reference implementation:
- [SimpleWebAuthn](https://simplewebauthn.dev/) for Node.js backend verification
- [WebAuthn.guide](https://webauthn.guide/) for protocol documentation

## Deployment

### Build for Production
```bash
npm run build
# Output in /dist
```

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

### Environment Variables
Create `.env` for production:
```
VITE_API_URL=https://your-backend-api.com
VITE_RP_ID=your-domain.com
VITE_RP_NAME=Your School Name
```

## Roadmap

- [ ] Backend API (Node.js/Express or Django)
- [ ] Database integration (PostgreSQL)
- [ ] Parent notification system (email/SMS)
- [ ] Mobile app (React Native)
- [ ] Physical fingerprint scanner SDK integration
- [ ] Multi-school/tenant support
- [ ] QR code backup attendance method
- [ ] Bulk import via CSV

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Screenshots

### Dashboard
Real-time attendance stats, weekly bar chart, and recent activity.

### Biometric Attendance
Select a student, click Scan, and the simulated fingerprint scanner records attendance.

### Reports
Per-student rates, class comparisons, and low-attendance alerts.
