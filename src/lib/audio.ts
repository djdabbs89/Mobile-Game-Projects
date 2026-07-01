class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private filterNode: BiquadFilterNode | null = null;
    private musicInterval: number | null = null;

    private isInitialized = false;
    private isMuted = false;
    
    private wantedLevel = 0;
    private musicMode: 'menu' | 'game' | null = null;

    init() {
        if (this.isInitialized) return;
        
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // Default volume
            this.masterGain.connect(this.ctx.destination);
            
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.6;
            
            this.filterNode = this.ctx.createBiquadFilter();
            this.filterNode.type = 'lowpass';
            this.filterNode.frequency.value = 20000;
            
            this.musicGain.connect(this.filterNode);
            this.filterNode.connect(this.masterGain);

            this.isInitialized = true;
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }

    resume() {
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMute(mute: boolean) {
        this.isMuted = mute;
        if (this.masterGain) {
            this.masterGain.gain.value = mute ? 0 : 0.5;
        }
    }

    setWantedLevel(level: number) {
         this.wantedLevel = level;
    }

    setMuffled(muffled: boolean) {
        if (!this.filterNode || !this.ctx) return;
        // Apply low-pass filter effect to hyper-focus player
        this.filterNode.frequency.setTargetAtTime(muffled ? 400 : 20000, this.ctx.currentTime, 0.2);
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol = 1, slideFreq?: number, dest?: AudioNode) {
        if (!this.ctx || !this.masterGain || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1 * vol, this.ctx.currentTime + duration * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(dest || this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
        setTimeout(() => { osc.disconnect(); gain.disconnect(); }, duration * 1000 + 100);
    }

    private playNoise(duration: number, vol = 1, filterType: BiquadFilterType = 'lowpass', filterFreq = 1000, dest?: AudioNode) {
        if (!this.ctx || !this.masterGain || this.isMuted) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest || this.masterGain);

        noise.start();
        setTimeout(() => { noise.disconnect(); filter.disconnect(); gain.disconnect(); }, duration * 1000 + 100);
    }

    private playKick(vol = 1, dest?: AudioNode) {
        this.playTone(150, 'sine', 0.5, vol, 40, dest);
    }

    private playHat(vol = 1, dest?: AudioNode) {
        this.playNoise(0.1, vol, 'highpass', 8000, dest);
    }

    private playPad(freq: number, duration: number, vol = 1, dest?: AudioNode) {
        if (!this.ctx || this.isMuted) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.01, this.ctx.currentTime); // Slight detune

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol * 0.5, this.ctx.currentTime + duration * 0.3); // Slow attack
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration); // Slow release

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(dest || this.masterGain!);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + duration);
        osc2.stop(this.ctx.currentTime + duration);
        setTimeout(() => { osc1.disconnect(); osc2.disconnect(); gain.disconnect(); }, duration * 1000 + 100);
    }

    // --- Sound Effects ---

    playClick() {
        this.playTone(600, 'sine', 0.05, 0.3);
    }

    playCoin() {
        this.resume();
        this.playTone(987.77, 'sine', 0.1, 0.3); // B5
        setTimeout(() => this.playTone(1318.51, 'sine', 0.3, 0.4), 100); // E6
    }

    playHit() {
         this.resume();
         this.playNoise(0.2, 0.3, 'lowpass', 1000);
         this.playTone(150, 'square', 0.2, 0.5, 50);
    }

    playStealStart() {
        this.resume();
        this.playTone(220, 'triangle', 0.3, 0.2, 440);
        this.setMuffled(true);
    }

    playStealSuccess() {
        this.resume();
        this.setMuffled(false);
        this.playTone(440, 'square', 0.1, 0.2);
        setTimeout(() => this.playTone(554.37, 'square', 0.1, 0.2), 100);
        setTimeout(() => this.playTone(659.25, 'square', 0.3, 0.3), 200);
    }

    playCaught() {
        this.resume();
        this.playTone(400, 'sawtooth', 0.5, 0.4, 100);
        setTimeout(() => this.playNoise(0.5, 0.5, 'lowpass', 1000), 100);
        this.setMuffled(false);
    }

    playPerkSelect() {
        this.resume();
        this.playTone(300, 'sine', 0.1, 0.3);
        setTimeout(() => this.playTone(400, 'sine', 0.1, 0.3), 100);
        setTimeout(() => this.playTone(600, 'sine', 0.4, 0.4), 200);
    }
    
    // --- Background Music ---

    startMenuMusic() {
        this.resume();
        if (this.musicMode === 'menu' && this.musicInterval) return;
        this.stopMusic();
        this.musicMode = 'menu';
        this.setMuffled(false);

        let step = 0;
        const padNotes = [65.41, 73.42, 82.41, 98.00]; // Deeper, brooding C2, D2, E2, G2

        // Slower tempo: 80 BPM -> ~750ms per beat
        this.musicInterval = window.setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            
            // Heart-beat kick drum pattern
            if (step % 4 === 0) {
                 this.playKick(0.7, this.musicGain!);
                 setTimeout(() => this.playKick(0.5, this.musicGain!), 250);
            }
            // Brooding synth pads
            if (step % 8 === 0) {
                 const noteFreq = padNotes[Math.floor(Math.random() * padNotes.length)];
                 this.playPad(noteFreq, 4.0, 0.15, this.musicGain!);
            }
            
            step++;
        }, 750);
    }

    startGameplayMusic() {
        this.resume();
        if (this.musicMode === 'game' && this.musicInterval) return;
        this.stopMusic();
        this.musicMode = 'game';
        this.setMuffled(false);

        let step = 0;
        
        // Cyberpunk/Tron-style minor progression, kept somewhat dusty
        const chords = [
            [65.41, 77.78, 98.00, 130.81, 155.56], // Cm
            [49.00, 58.27, 73.42, 98.00, 116.54],  // Gm
            [43.65, 51.91, 65.41, 87.31, 103.83],  // Fm
            [49.00, 58.27, 73.42, 98.00, 116.54],  // Gm
        ];

        // Dynamic tempo: updates each step
        const stepAudio = () => {
            if (!this.ctx || this.isMuted || this.musicMode !== 'game') return;

            // Slower, driving Cyberpunk tempo: start at 65 BPM, ramp up slightly with wanted level
            const currentBpm = Math.min(105, 65 + this.wantedLevel * 8);
            const msPerBeat = 60000 / currentBpm / 4; // 16th notes

            const currentChord = chords[Math.floor(step / 32) % chords.length];

            // Deep, driving synth bass (16th notes)
            const bassFreq = currentChord[step % 2 === 0 ? 0 : 1];
            this.playTone(bassFreq, 'sawtooth', 0.15, 0.2, bassFreq * 0.95, this.musicGain!);
            this.playTone(bassFreq / 2, 'square', 0.15, 0.4, bassFreq / 2, this.musicGain!); // Deep sub bass

            // Subtle pulsing lo-fi pad (triangle waves)
            if (step % 16 === 0) {
                 currentChord.slice(2).forEach(note => {
                     this.playTone(note * 2, 'triangle', 0.8, 0.05, note * 2.01, this.musicGain!);
                 });
            }
            
            // Vinyl dust/crackle texture
            if (step % 4 === 0) {
                 this.playNoise(0.2, 0.015, 'highpass', 6000, this.musicGain!);
            }

            // Punchy kick on the beat
            if (step % 4 === 0) {
                 this.playKick(0.5, this.musicGain!);
            }
            
            // Lo-fi high hat
            if (step % 2 === 0) {
                 this.playHat(0.015, this.musicGain!);
            }

            // Muted, lo-fi snare
            if (step % 16 === 8) {
                 this.playNoise(0.2, 0.15, 'lowpass', 1200, this.musicGain!);
            }
            
            // Tron-like Arpeggio lead as difficulty ramps up
            if (this.wantedLevel >= 1 && step % 2 === 1) {
                 const arpNote = currentChord[step % currentChord.length] * 4;
                 const vol = 0.05 + Math.min(0.1, this.wantedLevel * 0.02);
                 this.playTone(arpNote, 'square', 0.1, vol, arpNote * 0.95, this.musicGain!);
            }

            step++;
            if (this.musicMode === 'game') {
                this.musicInterval = window.setTimeout(stepAudio, msPerBeat);
            }
        };

        stepAudio();
    }

    stopMusic() {
        if (this.musicInterval) {
            window.clearInterval(this.musicInterval);
            window.clearTimeout(this.musicInterval); 
            this.musicInterval = null;
        }
        this.musicMode = null;
    }
}

export const audio = new AudioEngine();
