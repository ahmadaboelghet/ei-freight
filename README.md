# EI Freight Platform 🚢✈️🚛

Unified Digital Freight Forwarding & Logistics Management Platform (Web, Mobile, Backend).

## Monorepo Architecture

```
ei-freight/
├── web/        # React 18 + Vite + Tailwind CSS + Firebase Web Dashboard
├── mobile/     # Flutter Cross-Platform Client App (iOS & Android)
└── backend/    # Firebase Functions, Security Rules & Firestore Indexes
```

---

## 1. Web Dashboard (`web/`)
Admin Command Center, Provider & Shipper portals matching enterprise freight workflows.
- Bilingual (Arabic RTL & English LTR).
- Real-time Firestore sync for RFQs, quotations, approvals, and dispatching.
- Interactive analytics, master data management, and KYC verification.

### Run Web:
```bash
cd web
npm install
npm run dev
```

---

## 2. Mobile App (`mobile/`)
Flutter application for shippers to create shipping requests, review quotes, track shipments, and receive push notifications.

### Run Mobile:
```bash
cd mobile
flutter pub get
flutter run
```

---

## 3. Backend & Firestore (`backend/`)
- Firestore security rules (`firestore.rules`)
- Compound composite indexes (`firestore.indexes.json`)
- Cloud Functions for automated status triggers & notifications (`functions/`)

### Deploy Backend:
```bash
cd backend
firebase deploy --only firestore:rules,firestore:indexes
```

---

## License & Author
EI Freight System © 2026. All rights reserved.
