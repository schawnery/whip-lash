class Metronome {
  private audioContext: AudioContext | null = null;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private isPlaying: boolean = false;
  private tempo: number = 100;
  private currentBeat: number = 0;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  private onBeat: ((beat: number, time: number) => void) | null = null;

  public init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public setOnBeatCallback(callback: (beat: number, time: number) => void) {
    this.onBeat = callback;
  }

  public start(tempo: number) {
    if (this.isPlaying) return;
    this.init();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    this.tempo = tempo;
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioContext!.currentTime + 0.1;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  public getContext() {
    return this.audioContext;
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat++;
  }

  private playClick(time: number) {
    if (!this.audioContext) return;
    
    // Create oscillator
    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    // High pitch for first beat, lower for others
    osc.frequency.value = (this.currentBeat % 4 === 0) ? 1000 : 800;
    
    // Envelope to make it clicky
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  private scheduler() {
    if (!this.isPlaying) return;

    while (this.nextNoteTime < this.audioContext!.currentTime + this.scheduleAheadTime) {
      this.playClick(this.nextNoteTime);
      if (this.onBeat) {
        // notify about the beat slightly before it happens so UI can react on time, or pass the exact audio time
        this.onBeat(this.currentBeat, this.nextNoteTime);
      }
      this.nextNote();
    }

    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }
}

export const metronome = new Metronome();
