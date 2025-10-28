# 🔍 Debugging Ball Detection

## What You Should See

When detection works correctly, you should see:

### Detection Results Page:
1. **Your uploaded image** displayed at the top
2. **"Detection Complete!"** headline
3. **"Found X balls on the table"** (X should be > 0)
4. **Detected Balls grid** showing:
   - Ball type (Cue, Solid, Stripe, Red, etc.)
   - Confidence percentage
   - Color indicator dot

### If You See "Found 0 balls":
Don't worry! This is common. Let's debug it.

---

## 🐛 Debugging Steps

### Step 1: Check Browser Console

**Open Developer Tools:**
- Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: Press `F12` or `Ctrl+Shift+K`
- Safari: Enable Developer menu, then `Cmd+Option+I`

**Look for console messages:**
```
Detection params: {imageSize: "600x400", minRadius: 9, maxRadius: 90, step: 7}
Candidate circles before NMS: 45
Circles after NMS: 12
Detection complete: {totalBalls: 8, processingTime: 2341, ...}
```

**What to check:**
- `minRadius` and `maxRadius` - Are they reasonable? (should be 5-100 pixels)
- `Candidate circles before NMS` - Should be > 0 (if 0, threshold is too strict)
- `Circles after NMS` - Final count
- Any errors in red

---

### Step 2: Try a Simple Test Image

**Don't have a pool table image? Try this:**

1. **Google Image Search:**
   - Search: "pool table overhead"
   - Search: "billiard balls top view"
   - Filter by: Large size
   - Download a clear, overhead shot

2. **Good test image characteristics:**
   - ✅ Overhead view (looking straight down)
   - ✅ Bright, even lighting
   - ✅ Multiple balls clearly visible
   - ✅ Balls are distinct (not overlapping too much)
   - ✅ High contrast between balls and table

3. **Bad test images:**
   - ❌ Side angle view
   - ❌ Dark/shadowy
   - ❌ Blurry
   - ❌ Balls too small in frame
   - ❌ Extreme close-up of one ball

---

### Step 3: Adjust Detection Sensitivity

If console shows `Candidate circles before NMS: 0`, the detector is too strict.

**Edit this file:** `shotsensor/lib/detection/simpleBallDetector.ts`

**Find line ~90:**
```typescript
if (score > 0.25) { // Lower threshold for MVP
```

**Try lowering to:**
```typescript
if (score > 0.15) { // Even more permissive
```

**Or even:**
```typescript
if (score > 0.10) { // Very permissive (may get false positives)
```

Then rebuild and test:
```bash
npm run dev
```

---

### Step 4: Adjust Ball Size Range

If balls are too big or too small, detection will miss them.

**Edit line ~140 in `simpleBallDetector.ts`:**

**Current:**
```typescript
const minRadius = Math.floor(Math.min(width, height) * 0.015); // 1.5%
const maxRadius = Math.floor(Math.min(width, height) * 0.15);  // 15%
```

**For smaller balls (distant view):**
```typescript
const minRadius = Math.floor(Math.min(width, height) * 0.01);  // 1%
const maxRadius = Math.floor(Math.min(width, height) * 0.12);  // 12%
```

**For larger balls (close-up):**
```typescript
const minRadius = Math.floor(Math.min(width, height) * 0.02);  // 2%
const maxRadius = Math.floor(Math.min(width, height) * 0.20);  // 20%
```

---

### Step 5: Test with Different Images

**Try multiple images:**

1. **Close-up** (2-3 balls, fills screen)
2. **Full table** (all balls visible)
3. **Good lighting** (bright, even)
4. **Difficult lighting** (shadows, glare)

**Document what works:**
- Which images detect balls?
- How many balls does it find?
- What's the confidence level?

---

## 🎯 Expected Results

### MVP Success Criteria:

**Don't expect perfection!** This is what's realistic:

| Scenario | Expected Detection Rate |
|----------|-------------------------|
| Good conditions (bright, overhead) | 50-80% of balls |
| Decent conditions (slight angle) | 30-60% of balls |
| Poor conditions (shadows, angle) | 10-40% of balls |
| Very poor conditions | 0-20% of balls |

**Color accuracy:** 40-70% (distinguishing stripes/solids is hard!)

**This is normal for an MVP!** Computer vision is challenging.

---

## 📊 Sample Console Output

### Good Detection:
```
Detection params: {imageSize: "600x450", minRadius: 9, maxRadius: 90, step: 7}
Found circles: 47
Candidate circles before NMS: 47
Circles after NMS: 11
Detection complete: {
  totalBalls: 11,
  processingTime: 2134,
  imageSize: "600x450"
}
```

### No Detection:
```
Detection params: {imageSize: "600x450", minRadius: 9, maxRadius: 90, step: 7}
Found circles: 0
Candidate circles before NMS: 0
Circles after NMS: 0
Detection complete: {totalBalls: 0, ...}
```
**Fix:** Lower threshold or adjust ball size range.

---

## 🔧 Quick Fixes

### Problem: "Found 0 balls" always

**Solution 1 - Lower threshold:**
```typescript
// In simpleBallDetector.ts line ~90
if (score > 0.10) { // Was 0.25
```

**Solution 2 - Adjust ball sizes:**
```typescript
// In simpleBallDetector.ts line ~140
const minRadius = Math.floor(Math.min(width, height) * 0.01); // Smaller min
const maxRadius = Math.floor(Math.min(width, height) * 0.20); // Larger max
```

**Solution 3 - Check image:**
- Is it actually a pool/snooker table?
- Are balls clearly visible?
- Is it an overhead view?

---

### Problem: Detection is very slow (>10 seconds)

**Solution - Reduce sampling:**
```typescript
// In simpleBallDetector.ts line ~143
const step = Math.floor(minRadius * 1.5); // Was 0.8 (faster, less accurate)
```

---

### Problem: Detects too many false positives

**Solution - Raise threshold:**
```typescript
// In simpleBallDetector.ts line ~90
if (score > 0.35) { // Was 0.25 (more strict)
```

---

### Problem: Color classification is wrong

**Solution - This is expected in MVP!**

Color detection is hard with varying lighting. Phase 3 will add manual correction.

For now, focus on:
1. Does it detect circles? ✅
2. Are they roughly where balls are? ✅
3. Are colors somewhat reasonable? ✅

If yes to all 3, you're good for MVP!

---

## 🎨 Visual Debugging

Want to see what the detector sees?

**Add this to `simpleBallDetector.ts` after line ~165:**

```typescript
// Debug: Draw edge map to canvas for visualization
const debugCanvas = document.createElement('canvas');
debugCanvas.width = width;
debugCanvas.height = height;
const debugCtx = debugCanvas.getContext('2d');
if (debugCtx) {
  const debugImageData = new ImageData(width, height);
  for (let i = 0; i < edges.length; i++) {
    const val = edges[i];
    debugImageData.data[i * 4] = val;
    debugImageData.data[i * 4 + 1] = val;
    debugImageData.data[i * 4 + 2] = val;
    debugImageData.data[i * 4 + 3] = 255;
  }
  debugCtx.putImageData(debugImageData, 0, 0);
  console.log('Edge map:', debugCanvas.toDataURL());
}
```

Then in console, right-click the "Edge map: data:image..." and open in new tab to see edges.

---

## 📝 Testing Checklist

Before saying "it doesn't work":

- [ ] Opened browser console (F12)
- [ ] Checked for console messages
- [ ] Tried at least 3 different images
- [ ] Used overhead view images
- [ ] Verified images have good lighting
- [ ] Adjusted threshold if needed (0.25 → 0.15 → 0.10)
- [ ] Checked ball size parameters
- [ ] Documented what images work vs don't work

---

## 💡 Pro Tips

### For Best Detection:

1. **Image Quality:**
   - Overhead view (90° angle)
   - Bright, even lighting
   - High resolution (at least 1280x720)
   - Balls clearly visible

2. **Ball Visibility:**
   - Not overlapping too much
   - Good contrast with table
   - Not in shadows
   - Not too small in frame

3. **Testing Strategy:**
   - Start with a VERY clear, simple image
   - Get that working first
   - Then try more complex images
   - Adjust parameters based on results

### What to Report:

When asking for help, provide:
- Console output (detection params)
- Number of candidate circles found
- Image characteristics (angle, lighting, size)
- What threshold you tried

---

## 🚀 If All Else Fails

**Temporary workaround for demo:**

You can manually create fake detections for demo purposes:

```typescript
// In simpleBallDetector.ts, add after line ~50:
// DEMO MODE - Remove after testing real images
if (process.env.NODE_ENV === 'development') {
  return {
    balls: [
      {
        id: 'demo-1',
        position: { x: 100, y: 100 },
        radius: 20,
        confidence: 0.85,
        ballType: 'cue',
        color: '#FFFFFF',
        number: undefined,
      },
      // Add more demo balls...
    ],
    imageWidth: img.width,
    imageHeight: img.height,
    timestamp: Date.now(),
    processingTimeMs: 1000,
  };
}
```

But try real detection first!

---

## ✅ Success Looks Like:

**In browser console:**
```
Detection params: {imageSize: "600x450", minRadius: 9, maxRadius: 90, ...}
Found circles: 38
Candidate circles before NMS: 38
Circles after NMS: 8
Detection complete: {totalBalls: 8, processingTime: 2341}
```

**On screen:**
- "Found 8 balls on the table"
- List of detected balls with types
- Detection summary with breakdown
- Reasonable confidence scores (30-90%)

**Don't need:**
- 100% accuracy (50%+ is good!)
- Perfect color detection (rough is fine!)
- All balls detected (half is success!)

---

Good luck! Check console first, then adjust parameters. You got this! 🎱
