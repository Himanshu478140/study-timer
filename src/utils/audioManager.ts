export type SoundCategory = 'master' | 'ambient' | 'ui';

class AudioManager {
    private ambientAudio: HTMLAudioElement | null = null;
    private activeInstances: Set<HTMLAudioElement> = new Set();
    private isStoppingAll: boolean = false;
    private ambienceVolume: number = 0.5;
    private masterVolume: number = 1.0;
    private uiVolume: number = 0.6;
    private onStateChange: ((state: { loading: boolean; error: string | null }) => void) | null = null;

    // Cache for UI sounds to avoid reloading
    private sfxCache: Map<string, HTMLAudioElement> = new Map();

    constructor() {
        // Basic init
    }

    setStateListener(callback: (state: { loading: boolean; error: string | null }) => void) {
        this.onStateChange = callback;
    }

    setVolume(category: SoundCategory, value: number) {
        const clamped = Math.max(0, Math.min(1, value));

        switch (category) {
            case 'master':
                this.masterVolume = clamped;
                this.updateCurrentVolumes();
                break;
            case 'ambient':
                this.ambienceVolume = clamped;
                this.updateCurrentVolumes();
                break;
            case 'ui':
                this.uiVolume = clamped;
                break;
        }
    }

    private updateCurrentVolumes() {
        if (this.ambientAudio) {
            this.ambientAudio.volume = this.ambienceVolume * this.masterVolume;
        }
    }

    playSFX(url: string) {
        try {
            let audio = this.sfxCache.get(url);
            if (!audio) {
                audio = new Audio(url);
                this.sfxCache.set(url, audio);
            } else {
                audio.currentTime = 0; // Reset if cached
            }

            audio.volume = this.uiVolume * this.masterVolume;
            audio.play().catch(e => console.warn('SFX Playback failed', e));
        } catch (err) {
            console.warn('Error playing SFX', err);
        }
    }

    private monitorInterval: any = null;
    private isCrossfading: boolean = false;

    async playAmbient(url: string) {
        // If same sound is playing, do nothing
        if (this.ambientAudio && this.ambientAudio.src === url && !this.ambientAudio.paused) {
            return;
        }

        this.stopAmbient();
        this.isStoppingAll = false; // Reset stopping flag for new track

        const newAudio = new Audio(url);
        newAudio.volume = 0;

        try {
            if (this.onStateChange) this.onStateChange({ loading: true, error: null });
            await newAudio.play();
            // If user stopped while we were awaiting play, abort immediately
            if (this.isStoppingAll) {
                newAudio.pause();
                return;
            }
            if (this.onStateChange) this.onStateChange({ loading: false, error: null });
        } catch (e) {
            console.warn('Ambient playback failed', e);
            if (this.onStateChange) this.onStateChange({ loading: false, error: 'Playback failed. Check the link!' });
            return;
        }

        newAudio.onerror = () => {
            if (this.onStateChange) this.onStateChange({ loading: false, error: 'Audio source error.' });
        };

        this.ambientAudio = newAudio;
        this.activeInstances.add(newAudio);
        this.fadeIn(newAudio, 2000);
        this.startLoopMonitor(url);
    }

    private startLoopMonitor(url: string) {
        if (this.monitorInterval) clearInterval(this.monitorInterval);
        this.isCrossfading = false;

        this.monitorInterval = setInterval(() => {
            if (!this.ambientAudio || this.isCrossfading) return;

            const duration = this.ambientAudio.duration;
            const currentTime = this.ambientAudio.currentTime;

            if (isNaN(duration) || duration === 0) return;

            // Adjust crossfade window based on duration (max 2s, or 10% of track)
            const crossfadeWindow = Math.min(2, duration * 0.1);
            const timeLeft = duration - currentTime;

            if (timeLeft < crossfadeWindow && timeLeft > 0.1) {
                this.isCrossfading = true;
                this.crossfade(url, crossfadeWindow);
            }
        }, 300);
    }

    private async crossfade(url: string, durationMs: number) {
        if (!this.ambientAudio || this.isStoppingAll) return;

        const oldAudio = this.ambientAudio;
        const newAudio = new Audio(url);
        newAudio.volume = 0;

        try {
            await newAudio.play();
            // Race condition check: if stop was called while we were loading the next loop buffer
            if (this.isStoppingAll) {
                newAudio.pause();
                return;
            }

            this.ambientAudio = newAudio;
            this.activeInstances.add(newAudio);
            this.fadeOut(oldAudio, durationMs * 1000);
            this.fadeIn(newAudio, durationMs * 1000);
            this.isCrossfading = false;
        } catch (e) {
            console.warn('Crossfade failed', e);
            this.isCrossfading = false;
        }
    }

    stopAmbient() {
        this.isStoppingAll = true;
        if (this.monitorInterval) clearInterval(this.monitorInterval);
        this.monitorInterval = null;
        this.isCrossfading = false;

        // Force stop ALL tracked instances immediately
        this.activeInstances.forEach(audio => {
            this.fadeOut(audio, 800); // Quick fade out for all
        });

        this.activeInstances.clear();
        this.ambientAudio = null;
    }

    private fadeOut(audio: HTMLAudioElement, durationMs: number) {
        const startVol = audio.volume;
        const steps = 20;
        const stepTime = durationMs / steps;
        const volStep = startVol / steps;

        const fadeInterval = setInterval(() => {
            if (audio.volume > volStep) {
                audio.volume -= volStep;
            } else {
                audio.volume = 0;
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                this.activeInstances.delete(audio);
                clearInterval(fadeInterval);
            }
        }, stepTime || 50);
    }

    private fadeIn(audio: HTMLAudioElement, durationMs: number) {
        const targetVol = this.ambienceVolume * this.masterVolume;
        const steps = 20;
        const stepTime = durationMs / steps;
        const volStep = targetVol / steps;

        audio.volume = 0;

        const fadeInterval = setInterval(() => {
            const currentTarget = this.ambienceVolume * this.masterVolume;
            if (audio.volume < currentTarget - volStep) {
                audio.volume += volStep;
            } else {
                audio.volume = currentTarget;
                clearInterval(fadeInterval);
            }
        }, stepTime || 50);
    }
}

export const audioManager = new AudioManager();
