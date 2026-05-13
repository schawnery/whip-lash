# Rhythm Accuracy MVP

A solo rhythm/tempo accuracy game. Test how accurately you can keep tempo after hearing an initial metronome count-in.

## Features

- **Adjustable BPM:** Choose any tempo from 60 to 220 BPM.
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

## How to Play

1. **Select Tempo:** Adjust the BPM slider.
2. **Listen:** Click "Start Test". You'll hear 4 clicks of a metronome. Internalize the tempo.
3. **Tap:** When the metronome stops, continue the rhythm by tapping the spacebar or clicking/tapping the screen on every beat.
4. **Results:** After 16 beats, your timing accuracy will be calculated. See your overall grade, accuracy percentage, and whether you tend to rush or drag!

## How Grading Works

The grading system is based on **absolute timing accuracy** against the established metronome, not relative interval accuracy. This means your score is calculated by comparing the exact time you tapped to the exact time the beat *should* have occurred based on the target BPM.

### The Math
For each beat, the system calculates your error in milliseconds (`errorMs`):

- **Perfect:** `≤ 20ms` error ➔ 100 points
- **Great:** `≤ 50ms` error ➔ 80 points
- **Good:** `≤ 100ms` error ➔ 50 points
- **Poor:** `≤ 150ms` error ➔ 20 points
- **Miss:** `> 150ms` error ➔ 0 points

Your overall accuracy is the average of these scores across all 16 beats.

### Alignment and Drift
Because grading is based on absolute time, **if you tap at a consistent but slightly incorrect BPM, your score will drop dramatically over time**. 

For example, if the target is 120 BPM (500ms per beat) and you are consistently tapping at 118 BPM (~508ms per beat):
- Beat 1: ~8ms late (100 points)
- Beat 5: ~40ms late (80 points)
- Beat 10: ~80ms late (50 points)
- Beat 16: ~128ms late (20 points)

Even though your personal tempo is steady, your alignment drifts further from the "true" metronome grid, resulting in lower scores on later beats.
