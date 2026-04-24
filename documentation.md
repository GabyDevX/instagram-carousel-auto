# Instagram Carousel Auto-Generator Documentation

This project is a high-fidelity automated system for creating Instagram carousels using HTML, CSS, and Puppeteer. It ensures pixel-perfect exports (1080x1440) with premium aesthetics.

## 🛠 Project Structure

- **`carousel.html`**: The master template. Contains the structure, styling, and content for all slides.
- **`screenshot.js`**: The CLI extraction tool. Uses Puppeteer to take high-DPI screenshots of each slide.
- **`api/index.js`**: An Express-based API for remote generation (compatible with Vercel).
- **`public/`**: Frontend assets for the generator's UI.

---

## 🎨 Design System

When generating or modifying the carousel, adhere to these standards:

- **Dimensions**: 1080px width x 1440px height (4:5 ratio).
- **Colors**:
  - `primary`: #2d7a7a (Teal)
  - `accent`: #c8924a (Gold)
  - `background`: #fdf8f3 (Cream) or #1a2e2e (Dark Teal)
- **Typography**: 'DM Serif Display' for headlines, 'DM Sans' for body text.
- **Visuals**: Use subtle grain overlays, smooth gradients, and rounded cards (32px+).

---

## 🤖 Instructions for AI Generation

If you are an AI assistant tasked with updating the carousel or creating a new one:

### 1. Structure Requirements
The HTML must contain:
- A `.viewport` container (1080x1440).
- A `.track` container that holds all slides.
- Multiple `.slide` divs inside the track.
- A `window.goTo(index)` Javascript function to navigate the track by translating the X position.

### 2. Standard Slide Sequence
1.  **Cover (Slide 1)**: Impactful headline, logo, and a "hook" subtext.
2.  **The Hook/Problem**: Empathize with the user's pain points.
3.  **The Solution**: Introduce the product/idea as the answer.
4.  **Key Features**: 2-3 slides detailing how it works.
5.  **Social Proof/Pricing**: Trust signals or plan comparisons.
6.  **CTA (Final Slide)**: Clear "Call to Action" with handles and URLs.

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
