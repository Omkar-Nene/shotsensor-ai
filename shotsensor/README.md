# 🎱 ShotSensor - AI Pool & Snooker Shot Recommender

An AI-powered mobile-first web application that analyzes pool and snooker tables to recommend the best shots with realistic trajectory visualization.

**Perfect for**: Portfolio demonstrations, learning shot selection, practicing strategy, and analyzing table positions.

---

## 🚀 Features

### ✅ Phase 1 - MVP (Current)
- **Game Mode Selection**: Choose between Pool (8-ball) and Snooker
- **Player Type Selection**: Select Stripes or Solids for pool games
- **Mobile Camera Capture**: Direct camera access optimized for mobile devices
- **Image Upload Fallback**: Desktop-friendly file upload option
- **Responsive Mobile-First UI**: Large touch targets, optimized for phones
- **PWA Support**: Add to home screen on mobile devices

### 🔨 Phase 2 - Coming Next
- **AI Ball Detection**: TensorFlow.js + HSV color classification
- **Color-Specific Detection**: Distinguish between ball types (stripes vs solids, snooker colors)
- **Ball Labeling**: Display detected balls with types and confidence scores
- **Manual Correction**: Tap to fix misidentified balls

### 🎯 Phase 3 - Future
- **Shot Recommendations**: AI-powered analysis of best shots
- **Trajectory Visualization**: Canvas-based path drawing with physics
- **Difficulty Ratings**: Shot complexity scoring (1-10)
- **Success Probability**: Calculated potting likelihood
- **Shot Details**: Cue action, spin, and power recommendations

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: TensorFlow.js (planned)
- **Camera**: MediaDevices API
- **Deployment**: Vercel (FREE tier)

### Why This Stack?

✅ **100% Free** - No paid APIs or services
✅ **Mobile-First** - Optimized for phone cameras
✅ **Client-Side AI** - No backend needed, works offline
✅ **Fast Load Times** - Optimized for 4G connections
✅ **PWA Ready** - Installable on mobile devices

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager
- Modern web browser with camera support

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Deploy to Vercel (FREE)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy automatically
4. Get your live URL!

**No configuration needed** - works out of the box on Vercel's free tier.

---

## 📂 Project Structure

```
shotsensor/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main app with state management
│   └── globals.css             # Global styles
├── components/
│   ├── camera/
│   │   └── CameraCapture.tsx   # Mobile camera component
│   ├── detection/              # Ball detection (coming soon)
│   ├── shot-recommendation/    # Shot visualization (coming soon)
│   └── ui/
│       ├── Button.tsx          # Reusable button
│       ├── GameModeSelector.tsx    # Game mode picker
│       └── PlayerTypeSelector.tsx  # Ball type picker
├── lib/
│   ├── detection/              # AI detection logic (coming soon)
│   ├── physics/                # Trajectory calculations (coming soon)
│   └── utils/
│       ├── colors.ts           # HSV color utilities
│       └── geometry.ts         # Math/geometry functions
├── types/
│   └── index.ts                # TypeScript type definitions
├── public/
│   ├── manifest.json           # PWA manifest
│   └── demo-images/            # Sample test images
└── README.md
```

---

## 📱 Mobile Optimization

This app is **mobile-first** with:
- ✅ Large touch targets (min 44x44px)
- ✅ Camera access on iOS Safari & Android Chrome
- ✅ Responsive layouts (portrait & landscape)
- ✅ Optimized image processing
- ✅ Fast performance on mobile hardware
- ✅ Works offline after initial load (PWA)

---

## 🎮 How It Works

### User Flow

1. **Select Game Mode** → Choose Pool or Snooker
2. **Select Ball Type** → (Pool only) Choose Stripes or Solids
3. **Capture Table** → Take photo or upload image
4. **AI Detection** → Balls are detected and classified by color
5. **View Recommendations** → See top 3 shot suggestions with trajectories
6. **Analyze Shot** → View difficulty, probability, and technique

---

## 🎨 Ball Detection Approach (Phase 2)

### Hybrid Method: TensorFlow.js + Color Classification

**Phase A: Circle Detection**
- Use TensorFlow.js for object detection
- Identify spherical objects in image
- Filter by size and position

**Phase B: Color Classification**
- Extract pixel data from detected regions
- Convert RGB → HSV color space (better for lighting)
- Match against pre-calibrated color ranges
- Calculate confidence scores

**Phase C: Ball Type Identification**

For Pool:
- White → Cue ball
- Solid colors → Balls 1-7
- Striped patterns → Balls 9-15
- Black → 8-ball

For Snooker:
- White → Cue ball
- Red → Red balls (1 point)
- Yellow, Green, Brown, Blue, Pink, Black → Colored balls (2-7 points)

---

## 🧪 Testing

### Test on these devices:
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari

### Real-world testing:
- [ ] Pool hall lighting
- [ ] Various table positions
- [ ] Different ball arrangements
- [ ] Camera distance

---

## 🎓 Development Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Next.js project setup
- [x] Mobile-first UI components
- [x] Game mode selection
- [x] Player type selection
- [x] Camera capture
- [x] Image upload fallback

### 🔨 Phase 2: Ball Detection (NEXT)
- [ ] TensorFlow.js integration
- [ ] Circle detection algorithm
- [ ] HSV color classification
- [ ] Ball type identification
- [ ] Canvas overlay visualization
- [ ] Manual correction UI

### 🎯 Phase 3: Shot Recommendations (FUTURE)
- [ ] Geometry utilities
- [ ] Physics simulation
- [ ] Shot ranking algorithm
- [ ] Trajectory calculation
- [ ] Canvas drawing system
- [ ] Shot details panel

---

## 📝 License

MIT License - feel free to use for your own portfolio!

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- AI powered by [TensorFlow.js](https://www.tensorflow.org/js)
- Deployed on [Vercel](https://vercel.com)

---

**Test it at your local pool hall!** 🎯
