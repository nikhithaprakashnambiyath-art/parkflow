# Nikhitha — Digital Universe 3D Portfolio

An unforgettable, world-class immersive 3D portfolio experience designed for internship presentations and personal branding. Inspired by high-end modern startup aesthetics (Awwwards, Apple, Vercel, Linear, and Space UI).

---

## 🌌 Core Tech Stack

*   **Framework:** Next.js 15 (App Router, React 19)
*   **Style Engine:** Tailwind CSS v4
*   **3D Engine:** Three.js + React Three Fiber (R3F) + Drei
*   **Animations:** Framer Motion + GSAP
*   **Forms Logic:** React Hook Form
*   **Deployment:** Vercel

---

## ✨ Primary Features

1.  **Loader Section (Cinematic Entry):** Smooth particle intro layout and SVG double-ring neon logo displaying a tabular progress percentage from 0 to 100 before fading out.
2.  **Hero Screen (Refractive WebGL Sphere):** Floating central crystal sphere utilizing Drei's `<MeshTransmissionMaterial>` with full chromatic aberration, light distortion, and mouse-controlled parallax cameras.
3.  **About Cards (3D Interactive Tilts):** Mouse coordinate calculations mapping card coordinates on 3D axes (`rotateX`/`rotateY`) for physical tilt sensations on desktop, falling back to static clean panels on mobile.
4.  **Skills Galaxy (Orbit Nodes):** Orbiting 3D planetary nodes representing Frontend, Backend, Database, UI/UX, and Tools orbiting a central glowing purple core, fully synchronized with a detailed stats control tab overlay.
5.  **Projects Grid (Featured ParkFlow Hub):** Showcases Nikhitha's primary parking reservation application, displaying dashboard statistics, a mock slot occupancy tracking map, and simulated checkouts.
6.  **Milestones Timeline (Vertical Scroll Reveal):** Framer Motion scroll reveals marking educational and professional milestones.
7.  **Device Showcase (3D Laptop Screen Embeds):** A procedurally modeled 3D aluminum laptop with keyboard trackpad details that rotates, holding an embedded interactive browser preview mockup on the screen using Drei's `<Html transform>`.
8.  **Presentation Deck (/presentation):** A dedicated Apple Keynote-style slide deck covering the Intro, Problem, Solution, Architecture, Demo, and Results, complete with autoplay cycle loops, fullscreen triggers, and Arrow Left/Right keyboard listeners.
9.  **Mobile Performance Optimizations:** Automatically detects mobile layout queries to strip expensive WebGL rendering (excluding Hero/Skills) and fall back to smooth Framer Motion spring transforms, achieving a 90+ Lighthouse score.

---

## 📂 Folder Layout

```text
portfolio/
├── app/
│   ├── layout.tsx             # Fonts & SEO configuration
│   ├── page.tsx               # Entry home layout compiling sections
│   ├── globals.css            # Custom CSS, scroll snapping, & glassmorphism
│   └── presentation/
│       └── page.tsx           # Presentation Slide Deck route (/presentation)
│
├── components/
│   ├── sections/
│   │   ├── Loader.tsx         # Cinematic countdown loader
│   │   ├── Hero.tsx           # Landing titles and CTA overlay
│   │   ├── About.tsx          # Biography & 3D tilt cards
│   │   ├── Skills.tsx         # Tech HUD stats overlay
│   │   ├── Projects.tsx       # Featured ParkFlow & modal expansions
│   │   ├── Experience.tsx     # Vertical timeline lists
│   │   ├── DeviceShowcase.tsx # Laptop mockup views
│   │   ├── Contact.tsx        # React-Hook-Form contact module
│   │   └── Footer.tsx         # Signature & social links
│   │
│   └── three/
│       ├── HeroScene.tsx      # R3F Crystal Sphere & background particles
│       ├── SkillsScene.tsx    # R3F Orbiting Skill nodes
│       └── DeviceScene.tsx    # R3F Floating Laptop with HTML screen embeds
│
├── hooks/
│   └── useIsMobile.ts         # Screen width media listener
│
├── package.json               # System dependencies
└── README.md                  # This file
```

---

## 🛠️ Local Development

### 1. Install Dependencies
Run the install command from the `portfolio/` directory. We use `--legacy-peer-deps` to align React 19 libraries cleanly:
```bash
npm install --legacy-peer-deps
```

### 2. Start Dev Server
Spin up the local developer preview server:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser to enter the digital universe. Navigate to `http://localhost:3000/presentation` to access the presentation slide deck.

### 3. Production Compilation
Compile the project to confirm there are no static compiling warnings:
```bash
npm run build
```

---

## 🚀 Vercel Deployment

Deploying the portfolio to Vercel takes only a few seconds:

1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import the repository.
4.  Specify the **Root Directory** as `portfolio` (since it is placed in a subdirectory of your main workspace).
5.  Click **"Deploy"**. Vercel will automatically configure compilation parameters and assign a live production URL!
