# Rhythm Accuracy MVP

A solo rhythm/tempo accuracy game. Test how accurately you can keep tempo after hearing an initial metronome count-in.

## Features

- **Adjustable BPM:** Choose any tempo from 60 to 180 BPM.
- **Count-in Phase:** Listen to a 4-beat metronome count-in to establish the tempo.
- **Tap Phase:** Keep the rhythm going for 16 beats without the metronome.
- **Multiple Inputs:** Tap using the Spacebar, Mouse click, or Touch.
- **Detailed Results:** Receive an accuracy score, average error in milliseconds, and a beat-by-beat breakdown.

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS v4
- Minimal custom shadcn/ui components
- Web Audio API

## Setup

1. Make sure you have Node.js installed.
2. Clone or navigate to this directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## How to Play

1. **Select Tempo:** Open the app and adjust the BPM slider (default is 100).
2. **Listen:** Click "Start Test". You'll hear 4 clicks of a metronome. Internalize the tempo.
3. **Tap:** When the metronome stops, immediately continue the rhythm by tapping the spacebar or clicking/tapping the screen on every beat.
4. **Results:** After 16 beats, your timing accuracy will be calculated. See your overall grade, accuracy percentage, and whether you tend to rush or drag!
