# Instagram Carousel Auto-Generator Documentation

This project is a high-fidelity automated system for creating Instagram carousels using HTML, CSS, and Puppeteer. It ensures pixel-perfect exports (1080x1440) with premium aesthetics.

## 🛠 Project Structure

- **`carousel.html`**: The master template. Contains the structure, styling, and content for all slides.
- **`screenshot.js`**: The CLI extraction tool. Uses Puppeteer to take high-DPI screenshots of each slide.
- **`api/index.js`**: An Express-based API for remote generation (compatible with Vercel).
- **`public/`**: Frontend assets for the generator's UI.

## 📢 Marketing & Brand Alignment

To ensure all carousel content aligns with the **HogarCash** brand strategy, follow these core principles from the [marketing document](file:///c:/Users/gaboc/Desktop/Playground/InstagramCarousel/Generador/HOGARCASH_MARKETING.md):

### 1. Brand Identity & Voice
- **Name**: Always **HogarCash** (Home + Cash).
- **Core Tagline**: *"Las finanzas de tu hogar, bajo control."*
- **Tone**: Honest (no jargon), Warm (family-focused), Empowering, and Grounded (LATAM-specific).
- **Key Focus**: Solving "The Cuota Trap", "Multi-Currency Confusion", and "Shared Household Blind Spots".

### 2. Color Palette (Source of Truth)
| Role | Hex | Name |
|------|-----|------|
| Primary Brand | `#00d9b1` | HogarTeal (The "soul" of the brand) |
| Dark Background | `#070b10` | HogarDark |
| Light Base | `#ffffff` | HogarWhite |
| Income | `#22c55e` | IncomeGreen |
| Expenses | `#ef4444` | ExpenseRed |

### 3. Visual Language
- **Approachable & Modern**: Use `rounded-2xl` (20px-32px radius) for all cards and containers.
- **Depth**: Utilize glassmorphism (`backdrop-blur`) and soft shadows.
- **Latin-American Context**: Use terms like "cuotas", "servicios", and reference both local currency (e.g., UYU, ARS) and USD.

---

## 🎨 Design System (Technical Specs)

When generating or modifying the carousel, adhere to these standards:

- **Dimensions**: 1080px width x 1440px height (4:5 ratio).
- **CSS Variables**:
  - `--teal`: `#00d9b1` (Updated from Brand Book)
  - `--gold`: `#c8924a` (Accent)
  - `--dark`: `#070b10` (Hero background)
- **Typography**: 'DM Serif Display' for headlines, 'DM Sans' for body text.
- **Visuals**: Use subtle grain overlays, smooth gradients, and rounded corners (minimum 20px).

---

## 🤖 Instructions for AI Generation

If you are an AI assistant tasked with updating the carousel or creating a new one:

### 1. Structure Requirements
The HTML must contain:
- A `.viewport` container (1080x1440).
- A `.track` container that holds all slides.
- Multiple `.slide` divs inside the track.
- A `window.goTo(index)` Javascript function to navigate the track by translating the X position.

### 2. Standard Slide Sequence (Marketing-Aligned)
1.  **The Hook (Slide 1)**: Use a bold headline addressing a real LATAM problem (e.g., *"¿Fin de mes y no sabés en qué gastaste?"*).
2.  **The Pain Points (Slide 2)**: List specifics like "cuotas de la tarjeta", "servicios olvidados", or "falta de visión compartida".
3.  **The Solution (Slide 3)**: Introduce HogarCash as the tool for "Hogares Latinoamericanos".
4.  **Value Propositions (Slides 4-6)**: Focus on Multi-currency, Family roles, and the "Resumen Mensual".
5.  **CTA (Final Slide)**: Direct to `hogarcash.app` with the tagline.

### 3. Navigation Script
Ensure this snippet is at the end of the `<body>`:
```javascript
let current = 0;
const track = document.getElementById('track');
window.goTo = function (n) {
  const slideWidth = 1080;
  track.style.transform = `translateX(-${n * slideWidth}px)`;
};
```

---

## 📸 How to Extract Images

Once the `carousel.html` is ready, run the following command in your terminal:

```bash
node screenshot.js
```

### What happens next:
1.  **Automation**: Puppeteer launches a headless browser.
2.  **Archiving**: The current `carousel.html` is saved into a new timestamped folder (e.g., `Carousel_2026-04-24_10-30/source.html`).
3.  **Rendering**: The script iterates through every `.slide` element.
4.  **Exporting**: PNG files are generated at **2x scale** (Retina quality) for perfect clarity on Instagram.

---

## 💡 Prompting Tips
When asking the AI to modify the carousel, use prompts like:
- *"Add a new slide between Slide 3 and 4 explaining the 'Auto-Sync' feature."*
- *"Change the primary color theme to a 'Midnight Blue' aesthetic while keeping the gold accents."*
- *"Update the footer handle to @newhandle across all slides."*
- *"Refactor Slide 5 to use a 2x2 grid layout for features instead of a list."*
