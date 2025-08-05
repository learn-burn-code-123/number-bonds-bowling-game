// Sound effects for Number Bond Bowling Game
document.addEventListener('DOMContentLoaded', () => {
    // Create audio context when user interacts with the page
    let audioContext;
    
    // Initialize audio on first user interaction
    document.body.addEventListener('click', initAudio, { once: true });
    
    function initAudio() {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create and set up sounds
        createSounds();
    }
    
    function createSounds() {
        // Replace the audio elements with Web Audio API sounds
        window.playRollSound = function() {
            playSound(generateBowlingRollSound());
        };
        
        window.playPinsSound = function() {
            playSound(generatePinsFallingSound());
        };
        
        window.playCheerSound = function() {
            playSound(generateCheerSound());
        };
        
        window.playIncorrectSound = function() {
            playSound(generateIncorrectSound());
        };
        
        window.playWinSound = function() {
            playSound(generateWinSound());
        };
    }
    
    // Play a sound from an AudioBuffer
    function playSound(audioBuffer) {
        if (!audioContext) return;
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
    
    // Generate a bowling roll sound
    function generateBowlingRollSound() {
        const duration = 1.5;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a rolling sound effect
        for (let i = 0; i < buffer.length; i++) {
            // Decreasing noise over time
            const progress = i / buffer.length;
            const noise = (Math.random() * 2 - 1) * (1 - progress * 0.7);
            
            // Low frequency rumble
            const rumble = Math.sin(i * 0.01) * 0.3 * (1 - progress * 0.5);
            
            // Combine and apply envelope
            data[i] = (noise + rumble) * Math.pow(1 - progress, 0.5) * 0.8;
        }
        
        return buffer;
    }
    
    // Generate pins falling sound
    function generatePinsFallingSound() {
        const duration = 1.0;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a pins falling/crashing sound
        for (let i = 0; i < buffer.length; i++) {
            const progress = i / buffer.length;
            const t = i / audioContext.sampleRate;
            
            // Multiple impact sounds
            let val = 0;
            for (let j = 0; j < 8; j++) {
                const delay = j * 0.1;
                if (t > delay && t < delay + 0.1) {
                    const localProgress = (t - delay) / 0.1;
                    val += (Math.random() * 2 - 1) * Math.pow(1 - localProgress, 4) * 0.5;
                }
            }
            
            // Apply overall envelope
            data[i] = val * Math.pow(1 - progress, 1.5) * 0.8;
        }
        
        return buffer;
    }
    
    // Generate a cheer sound
    function generateCheerSound() {
        const duration = 1.0;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a cheerful sound
        for (let i = 0; i < buffer.length; i++) {
            const progress = i / buffer.length;
            const t = i / audioContext.sampleRate;
            
            // High frequency "yay" sound
            const yay1 = Math.sin(t * 1500 + Math.sin(t * 10) * 50) * 0.3;
            const yay2 = Math.sin(t * 1600 + Math.sin(t * 12) * 50) * 0.3;
            
            // Apply envelope
            const envelope = Math.pow(Math.sin(progress * Math.PI), 0.5);
            data[i] = (yay1 + yay2) * envelope * 0.5;
        }
        
        return buffer;
    }
    
    // Generate an incorrect/buzzer sound
    function generateIncorrectSound() {
        const duration = 0.5;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a buzzer sound
        for (let i = 0; i < buffer.length; i++) {
            const progress = i / buffer.length;
            const t = i / audioContext.sampleRate;
            
            // Buzzer effect
            const buzz = Math.sin(t * 400) * Math.sin(t * 30) * 0.7;
            
            // Apply envelope
            const envelope = Math.pow(1 - progress, 0.5);
            data[i] = buzz * envelope;
        }
        
        return buffer;
    }
    
    // Generate a win sound
    function generateWinSound() {
        const duration = 2.0;
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a victory fanfare sound
        for (let i = 0; i < buffer.length; i++) {
            const progress = i / buffer.length;
            const t = i / audioContext.sampleRate;
            
            // Notes sequence
            let note = 0;
            if (t < 0.5) note = 440; // A4
            else if (t < 1.0) note = 554.37; // C#5
            else if (t < 1.5) note = 659.25; // E5
            else note = 880; // A5
            
            // Create the tone with some vibrato
            const vibrato = Math.sin(t * 20) * 5;
            const tone = Math.sin((t * note + vibrato) * 2 * Math.PI) * 0.5;
            
            // Apply envelope
            const attackRelease = Math.min(progress * 4, (1 - progress) * 4, 1);
            data[i] = tone * attackRelease * 0.8;
        }
        
        return buffer;
    }
});
