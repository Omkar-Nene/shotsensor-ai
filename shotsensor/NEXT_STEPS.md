# 🚀 Next Steps - Phase 2: Ball Detection

## ✅ Phase 1 Complete!

We've successfully built the foundation:
- ✅ Mobile-first responsive UI
- ✅ Game mode selection (Pool/Snooker)
- ✅ Player type selection (Stripes/Solids)
- ✅ Camera capture with mobile optimization
- ✅ Image upload fallback
- ✅ Complete TypeScript type system
- ✅ Utility functions for colors and geometry
- ✅ PWA manifest
- ✅ Clean build (no errors or warnings)

---

## 🎯 Phase 2: AI Ball Detection

### Goal
Implement AI-powered ball detection with color-specific classification that works on mobile devices.

### Tasks

#### 1. TensorFlow.js Integration
**Priority: HIGH**

Files to create:
- `lib/detection/ballDetector.ts` - Main detection logic
- `lib/detection/tfjs-loader.ts` - TensorFlow.js model loading
- `hooks/useBallDetection.ts` - React hook for detection

Implementation steps:
```bash
# Install TensorFlow.js dependencies
npm install @tensorflow/tfjs-converter @tensorflow-models/coco-ssd
```

Key functions needed:
- `loadModel()` - Load TFJS model
- `detectObjects(imageData)` - Detect circular objects
- `filterBalls(detections)` - Filter out non-ball objects

**Testing**: Use sample pool table image to verify circle detection.

---

#### 2. HSV Color Classification
**Priority: HIGH**

Files to create:
- `lib/detection/colorClassifier.ts` - Color matching logic
- `lib/detection/colorRanges.ts` - HSV color definitions

Color ranges to define:
```typescript
// Pool colors
WHITE_CUE_BALL: { hMin: 0, hMax: 360, sMin: 0, sMax: 10, vMin: 70, vMax: 100 }
YELLOW_BALL: { hMin: 45, hMax: 65, sMin: 50, sMax: 100, vMin: 70, vMax: 100 }
BLUE_BALL: { hMin: 200, hMax: 240, sMin: 50, sMax: 100, vMin: 40, vMax: 80 }
RED_BALL: { hMin: 0, hMax: 15, sMin: 60, sMax: 100, vMin: 40, vMax: 80 }
// ... etc for all 15 balls

// Snooker colors
RED_SNOOKER: { hMin: 0, hMax: 10, sMin: 70, sMax: 100, vMin: 30, vMax: 70 }
YELLOW_SNOOKER: { hMin: 50, hMax: 70, sMin: 60, sMax: 100, vMin: 80, vMax: 100 }
// ... etc
```

Key functions:
- `classifyBallColor(imageData, x, y, radius)` - Determine ball type from color
- `calculateConfidence(hsvColor, targetRange)` - Confidence scoring
- `detectStripedPattern(imageData, x, y, radius)` - Distinguish stripes from solids

**Testing**: Calibrate colors using known pool ball images.

---

#### 3. Canvas Overlay Visualization
**Priority: HIGH**

Files to create:
- `components/detection/BallOverlay.tsx` - Canvas with detected balls
- `components/detection/BallLabel.tsx` - Individual ball labels
- `lib/utils/canvas.ts` - Canvas drawing utilities

Features:
- Draw circles over detected balls
- Label each ball with type and confidence
- Color-coded overlays (green = high confidence, yellow = medium, red = low)
- Touch/click to select ball for manual correction

Canvas drawing needed:
- Circle outlines
- Ball labels with numbers
- Confidence indicators
- Selection highlights

---

#### 4. Detection Processing Component
**Priority: MEDIUM**

File to create:
- `components/detection/DetectionProcessor.tsx`

Features:
- Progress indicator during detection
- Stage-by-stage updates:
  - "Loading AI model..."
  - "Detecting circles..."
  - "Classifying colors..."
  - "Identifying ball types..."
- Display detected ball count
- Show processing time

---

#### 5. Manual Correction UI
**Priority: MEDIUM**

Files to create:
- `components/detection/ManualCorrection.tsx` - Correction interface
- `components/detection/BallTypePicker.tsx` - Ball type selector modal

Features:
- Tap ball to open correction menu
- Select correct ball type from list
- Re-run detection on specific ball
- "Looks Good" button to proceed

---

#### 6. Performance Optimization
**Priority: MEDIUM**

Tasks:
- Use Web Workers for heavy computation
- Downscale images for faster processing (max 1920x1080)
- Implement progressive detection (quick scan → detailed scan)
- Add detection caching

Files to create:
- `lib/workers/detectionWorker.ts` - Web Worker for detection
- `hooks/useDetectionWorker.ts` - Hook to manage worker

---

#### 7. Testing & Calibration
**Priority: HIGH**

Create test suite:
- Unit tests for color classification
- Integration tests for full detection pipeline
- Real-world pool table test images

Test scenarios:
- Good lighting conditions
- Low light
- Mixed lighting (shadows)
- Different camera angles
- Various ball arrangements

Files to create:
- `__tests__/detection/colorClassifier.test.ts`
- `__tests__/detection/ballDetector.test.ts`
- `public/demo-images/test-pool-1.jpg`
- `public/demo-images/test-snooker-1.jpg`

---

## 📋 Implementation Order

### Week 1: Core Detection
1. ✅ Set up TensorFlow.js
2. ✅ Implement circle detection
3. ✅ Test with sample images
4. ✅ Validate detection accuracy

### Week 2: Color Classification
1. ✅ Implement HSV color classifier
2. ✅ Calibrate color ranges
3. ✅ Add stripe pattern detection
4. ✅ Test color accuracy

### Week 3: UI Integration
1. ✅ Build canvas overlay
2. ✅ Add ball labels
3. ✅ Implement manual correction
4. ✅ Polish UX

### Week 4: Polish & Test
1. ✅ Performance optimization
2. ✅ Real-world testing
3. ✅ Bug fixes
4. ✅ Documentation

---

## 🎨 UI/UX Considerations

### Detection Screen Flow:
1. Show captured image with loading overlay
2. Display progress stages
3. Reveal canvas with detected balls
4. Highlight low-confidence detections
5. Provide "Edit" button for corrections
6. "Analyze Shots" button when ready

### Mobile Interactions:
- Single tap = View ball details
- Long press = Open correction menu
- Pinch to zoom canvas
- Pan to explore image

---

## 🧪 Testing Strategy

### Unit Tests:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Test files needed:
- Color range validation
- HSV conversion accuracy
- Confidence scoring logic
- Geometry calculations

### Integration Tests:
- Full detection pipeline
- Camera → Detection → Display flow
- Error handling
- Edge cases (no balls, too many balls)

### Real-World Tests:
- Test at local pool hall
- Various lighting conditions
- Different table styles
- Multiple ball arrangements

---

## 📦 Additional Dependencies Needed

```bash
# AI/ML
npm install @tensorflow-models/coco-ssd

# Testing (optional)
npm install --save-dev jest @testing-library/react

# Image processing (if needed)
npm install sharp  # For server-side only
```

---

## 🐛 Known Challenges & Solutions

### Challenge 1: Mobile Performance
**Problem**: TensorFlow.js can be slow on older phones
**Solution**:
- Downscale images before processing
- Use Web Workers
- Show progress indicator
- Implement timeout with fallback

### Challenge 2: Lighting Variations
**Problem**: Pool hall lighting affects color detection
**Solution**:
- White balance correction
- Adaptive HSV ranges
- Manual calibration option
- Multi-sample color averaging

### Challenge 3: Ball Occlusion
**Problem**: Balls partially hidden behind others
**Solution**:
- Detect partial circles
- Infer position from visible arc
- Mark as "uncertain" in UI
- Allow manual placement

### Challenge 4: Stripe Detection
**Problem**: Distinguishing stripes from solids
**Solution**:
- Edge detection for stripe patterns
- Frequency analysis of color changes
- Confidence thresholds
- Default to manual correction if uncertain

---

## 📱 Mobile Testing Plan

### iOS Safari:
- [ ] Camera access works
- [ ] Image processing speed
- [ ] Canvas rendering
- [ ] Touch interactions
- [ ] Memory usage

### Android Chrome:
- [ ] Camera access works
- [ ] Image processing speed
- [ ] Canvas rendering
- [ ] Touch interactions
- [ ] Memory usage

### Performance Targets:
- Detection complete in < 5 seconds on mid-range phone
- UI remains responsive during processing
- No crashes with high-resolution images
- Memory usage < 200MB

---

## 🎯 Success Criteria for Phase 2

Phase 2 is complete when:
- ✅ AI detects at least 80% of balls correctly
- ✅ Color classification is 90%+ accurate in good lighting
- ✅ Works on iPhone and Android
- ✅ Processing completes in < 10 seconds
- ✅ Manual correction is intuitive
- ✅ Canvas overlay is clear and readable
- ✅ No major bugs or crashes

---

## 🔜 After Phase 2: Phase 3 Preview

Once detection is solid, Phase 3 will add:
- Shot recommendation algorithm
- Trajectory visualization
- Difficulty scoring
- Success probability calculations
- Physics simulation

See `PHASE_3.md` (to be created) for details.

---

## 💡 Quick Start for Phase 2

```bash
# 1. Install new dependencies
npm install @tensorflow-models/coco-ssd

# 2. Create detection module structure
mkdir -p lib/detection components/detection hooks

# 3. Start with ball detector
# Create lib/detection/ballDetector.ts

# 4. Test with sample image
# Add test image to public/demo-images/

# 5. Build canvas overlay
# Create components/detection/BallOverlay.tsx

# 6. Integrate into app
# Update app/page.tsx to use detection
```

---

**Ready to build Phase 2? Let's detect some balls! 🎱**
