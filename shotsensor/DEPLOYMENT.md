# 🚀 Deployment Guide - ShotSensor

## Deploy to Vercel (FREE) - Recommended

Vercel is the easiest and best option for deploying Next.js apps, especially for portfolio projects.

### Why Vercel?
- ✅ **100% Free** for hobby projects
- ✅ **Automatic deployments** from GitHub
- ✅ **HTTPS by default**
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Preview deployments** for every git push
- ✅ **Zero configuration** needed

### Free Tier Limits (More than enough!)
- 100GB bandwidth per month
- Unlimited websites
- Automatic SSL certificates
- Edge network (fast everywhere)

---

## 📋 Step-by-Step Vercel Deployment

### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Phase 1 complete"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shotsensor.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click "Add New Project"
4. Import your `shotsensor` repository
5. Click "Deploy"

**That's it!** Vercel auto-detects Next.js and deploys.

### 3. Your App is Live! 🎉

You'll get a URL like:
```
https://shotsensor-xyz123.vercel.app
```

### 4. Custom Domain (Optional)

Want a custom domain like `shotsensor.com`?

1. Buy domain from any registrar (Namecheap, GoDaddy, etc.)
2. In Vercel project settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate is automatic!

---

## 🔧 Environment Variables

Currently, this app has no environment variables (all client-side).

If you add any in the future:
1. Go to Vercel project → Settings → Environment Variables
2. Add your variables
3. Redeploy

---

## 📱 Test Your Deployment

### Essential Checks:

**Desktop:**
- [ ] Visit your Vercel URL
- [ ] Game mode selector loads
- [ ] Can select Pool/Snooker
- [ ] Player type selector works (Pool)
- [ ] Camera access prompts (must allow)
- [ ] File upload works as fallback

**Mobile (Critical!):**
- [ ] Open URL on iPhone Safari
- [ ] Open URL on Android Chrome
- [ ] Camera access permission prompt
- [ ] Camera preview shows
- [ ] Can capture photo
- [ ] Touch targets are easy to tap
- [ ] UI looks good in portrait
- [ ] UI looks good in landscape

### Camera Testing:
Since this is a **camera-heavy app**, test thoroughly:
- Different lighting conditions
- Portrait and landscape orientation
- Front and back camera (if applicable)
- Image quality after capture

---

## 🔄 Automatic Deployments

Every time you push to GitHub:
- ✅ Vercel automatically builds and deploys
- ✅ You get a preview URL for that commit
- ✅ Main branch deploys to production URL

```bash
# Make changes
git add .
git commit -m "Add ball detection"
git push

# Vercel automatically deploys!
# Check deployment status at vercel.com/dashboard
```

---

## 🌐 Alternative Deployment Options

### Netlify (Also Free)
Similar to Vercel, great alternative:

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Deploy!

Free tier: 100GB bandwidth/month

### Cloudflare Pages (Free)
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub
3. Framework preset: Next.js
4. Deploy!

Free tier: Unlimited bandwidth (!)

### Render (Free tier available)
1. Go to [render.com](https://render.com)
2. New → Static Site
3. Connect repo
4. Deploy!

Free tier: Limited bandwidth but decent

---

## 🔒 Security Considerations

### Current App (Phase 1):
- ✅ No user data stored
- ✅ No backend/database
- ✅ Camera data stays in browser
- ✅ Images not uploaded anywhere
- ✅ All processing client-side

### When Adding Features:
If you add user accounts or data storage later:
- Use environment variables for API keys
- Never commit secrets to git
- Use HTTPS only (Vercel does this automatically)
- Implement proper authentication

---

## 📊 Performance Optimization

### Current Build:
```bash
npm run build
```

Check output for bundle sizes. Current app should be:
- First Load JS: ~200-300KB (excellent)
- Fully static HTML (fast!)

### Optimizations Applied:
- ✅ Next.js automatic code splitting
- ✅ Image optimization via Next.js Image component (when used)
- ✅ Tailwind CSS purged for production
- ✅ Tree-shaking for unused code

### Future Optimizations:
When adding TensorFlow.js in Phase 2:
- Load model lazily (only when needed)
- Use CDN for large model files
- Implement loading states
- Consider Web Workers for heavy computation

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Check build logs:**
1. Go to Vercel dashboard
2. Click on failed deployment
3. View "Building" logs
4. Fix errors locally first:
```bash
npm run build
```

**Common issues:**
- TypeScript errors → Fix in your IDE
- Missing dependencies → Check package.json
- Import errors → Verify file paths

### Camera Doesn't Work on Deployed Site

**HTTPS Required:**
- Camera access ONLY works on HTTPS
- Vercel provides HTTPS automatically
- localhost works in development

**If camera still fails:**
- Check browser permissions
- Try different browser
- Check mobile settings → Site permissions

### App is Slow

**Phase 1 should be fast!** If slow:
- Check Vercel region (should be closest to you)
- Test on different network
- Check browser console for errors

---

## 📈 Analytics (Optional)

Want to track visitors?

### Vercel Analytics (Free)
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In your return:
<body>
  {children}
  <Analytics />
</body>
```

### Google Analytics (Free)
Add to `app/layout.tsx`:
```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

---

## 🎯 Portfolio Tips

### For Recruiters:
Make it easy to understand:

1. **Add a prominent "About" section:**
   - What problem does this solve?
   - What tech stack?
   - What's unique about it?

2. **Demo mode:**
   - Add sample images for testing
   - Don't require camera for demo

3. **GitHub README:**
   - Screenshots of each step
   - Architecture diagram
   - Challenges you solved

4. **Live Demo Button:**
   - Add to your portfolio site
   - QR code to test on mobile

### Showcase Features:
- ✅ Mobile-first design
- ✅ PWA capabilities
- ✅ TypeScript for type safety
- ✅ Modern React patterns
- ✅ Responsive UI with Tailwind
- ✅ Camera API integration

---

## 🔗 Sharing Your Project

### For Mobile Testing:
Create a QR code to your Vercel URL:
- Use [qr-code-generator.com](https://www.qr-code-generator.com/)
- Print it out
- Take to pool hall
- Scan and test!

### Social Media:
Share on LinkedIn/Twitter:
```
🎱 Just deployed ShotSensor - an AI-powered pool shot recommender!

Built with:
- Next.js 14
- TypeScript
- TensorFlow.js
- Mobile-first design

Try it: [your-url]

Features:
✅ Mobile camera integration
✅ AI ball detection (coming soon)
✅ Shot recommendations (coming soon)

#webdev #nextjs #AI #portfolio
```

---

## 📝 Vercel Project Settings

Recommended settings:

### General:
- ✅ Auto-deploy: ON
- ✅ Production branch: main
- ✅ Include source files: OFF (smaller deployments)

### Domains:
- Add your custom domain here (optional)

### Environment Variables:
- None needed currently

### Git:
- ✅ Enable automatic deployments from GitHub
- ✅ Deploy preview for all branches

---

## ✅ Deployment Checklist

Before sharing your app:

- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Tested on desktop browser
- [ ] Tested on iPhone Safari
- [ ] Tested on Android Chrome
- [ ] Camera permissions work
- [ ] All buttons are clickable
- [ ] No console errors
- [ ] README is complete
- [ ] GitHub repo is public
- [ ] Added to portfolio website

---

## 🎉 You're Live!

**Congratulations!** Your ShotSensor app is now live and accessible worldwide.

Next: Implement Phase 2 (Ball Detection) and redeploy!

**Share your deployed URL:**
- Add to portfolio
- Share on social media
- Show to recruiters
- Test at your local pool hall!

---

**Need Help?**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/yourusername/shotsensor/issues)
