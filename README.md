# Bass Tab Creator

A professional, web-based tool for creating, editing, and printing electric bass tablatures. Built with React, TypeScript, and Tone.js.

## 🚀 Features

- **Custom SVG Engine**: High-quality tablature rendering with proportional rhythmic spacing.
- **Advanced Notation**: Support for Whole to 32nd notes, Dotted notes, and Triplets.
- **Intelligent Editing**:
  - Keyboard-driven workflow for fast entry.
  - Mouse navigation and drag-selection.
  - Copy & Paste support (Ctrl+C / Ctrl+V).
  - Smart auto-beat creation and measure management.
- **Audio Playback**: Integrated Tone.js engine with visual playhead sync and BPM control.
- **Professional Export**: Explicit PDF generation with automatic pagination, headers, and section labeling.
- **Dark Mode**: Sleek dark theme by default with light mode toggle.
- **Persistence**: Save and load your work locally as `.btab` files.

---

## ⌨️ Keyboard Shortcuts

### Navigation
- **Arrow Keys**: Move cursor between strings and beats.
- **Shift + Arrows**: Select a range of notes/beats.

### Note Entry
- **0-9**: Enter fret number (buffer supports double digits up to 24).
- **Backspace / Delete**: Delete current beat (replaces with rest if not empty, or removes bar if empty).
- **r**: Toggle current beat as a Rest.

### Duration & Modifiers
- **w**: Whole Note
- **h**: Half Note
- **q**: Quarter Note
- **e**: Eighth Note
- **s**: Sixteenth Note
- **t**: Thirty-second Note
- **.**: Toggle Dotted Note (1.5x duration)
- *****: Toggle Triplet (2/3 duration)

### Measure Management
- **Enter / +**: Add a new measure.
- **Shift + Backspace**: Delete current measure.
- **Alt + Enter**: Insert a new beat.
- **Alt + Backspace**: Delete current beat.

### General
- **Space**: Play / Pause Audio.
- **Ctrl+C / Ctrl+V**: Copy / Paste selection.

---

## 🛠 Development

### Tech Stack
- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Audio**: Tone.js
- **PDF**: @react-pdf/renderer
- **Icons**: Lucide-React

### Project Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the production-ready optimized bundle.
- `npm run lint`: Run ESLint to check code quality.
- `npm run test`: Run unit tests using Vitest.
- `npm run preview`: Locally preview the production build.

### CI/CD
The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
- Lints the code.
- Runs all tests.
- Builds the application.
- Deploys the `main` branch to GitHub Pages.

---

## 📄 Custom File Format (.btab)
The application saves data in a custom JSON format that captures all musical properties, including custom tunings, section labels, and rhythmic modifiers.
