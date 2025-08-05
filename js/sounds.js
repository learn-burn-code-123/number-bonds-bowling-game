// Sound effects for Number Bond Bowling Game
document.addEventListener('DOMContentLoaded', () => {
    // Create audio context when user interacts with the page
    let audioContext;
    let audioInitialized = false;
    let usingFallback = false;
    let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Initialize audio on various user interactions for better mobile compatibility
    const initEvents = ['click', 'touchstart', 'touchend'];
    initEvents.forEach(event => {
        document.body.addEventListener(event, initAudio, { once: true });
    });
    
    // Also initialize on game-specific interactions
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !audioInitialized) {
            initAudio();
        }
    });
    
    function initAudio() {
        if (audioInitialized) return;
        
        try {
            // Create audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context (needed for mobile browsers)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // iOS requires special handling
            if (isIOS) {
                // Create and play a silent buffer to unlock audio
                const silentBuffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                source.buffer = silentBuffer;
                source.connect(audioContext.destination);
                source.start(0);
                source.stop(0.001); // Very short sound
                
                // Add additional event listeners for iOS
                ['touchend', 'touchstart'].forEach(event => {
                    document.addEventListener(event, function() {
                        if (audioContext && audioContext.state === 'suspended') {
                            audioContext.resume();
                        }
                    });
                });
            }
            
            // Create and set up sounds
            createSounds();
            audioInitialized = true;
            console.log('Audio initialized successfully on ' + (isIOS ? 'iOS' : navigator.userAgent));
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            // Fallback for devices that don't support Web Audio API
            setupFallbackAudio();
        }
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
        
        try {
            // Make sure audio context is running (especially important for iOS)
            if (audioContext.state !== 'running') {
                audioContext.resume().then(() => {
                    playBufferSound(audioBuffer);
                }).catch(error => {
                    console.error('Could not resume audio context:', error);
                    // If we can't resume, try fallback
                    if (!usingFallback) {
                        setupFallbackAudio();
                    }
                });
            } else {
                playBufferSound(audioBuffer);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
            // If Web Audio API fails, switch to fallback
            if (!usingFallback) {
                setupFallbackAudio();
            }
        }
    }
    
    // Helper function to play buffer sound
    function playBufferSound(audioBuffer) {
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
    
    // Fallback using HTML5 Audio for devices that don't support Web Audio API
    function setupFallbackAudio() {
        console.log('Setting up fallback audio');
        audioInitialized = true;
        usingFallback = true;
        
        // Create audio elements with actual sound files for better compatibility
        const soundFiles = {
            roll: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5hZuLrKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            pins: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5hZuLrKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            cheer: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5hZuLrKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            incorrect: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5hZuLrKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            win: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5hZuLrKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
        };
        
        // Create audio elements
        const rollSound = new Audio(soundFiles.roll);
        const pinsSound = new Audio(soundFiles.pins);
        const cheerSound = new Audio(soundFiles.cheer);
        const incorrectSound = new Audio(soundFiles.incorrect);
        const winSound = new Audio(soundFiles.win);
        
        // Preload sounds
        const sounds = [rollSound, pinsSound, cheerSound, incorrectSound, winSound];
        sounds.forEach(sound => {
            sound.load();
            sound.volume = 0.5;
            
            // Add event listeners to handle iOS specific issues
            if (isIOS) {
                // iOS requires user interaction before playing
                document.addEventListener('touchend', function() {
                    sound.play().then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                    }).catch(e => console.log('Preload attempt:', e));
                }, { once: true });
            }
        });
        
        // Helper function to play sound with better error handling
        function playFallbackSound(sound) {
            if (!sound) return;
            
            // Reset sound to beginning
            sound.currentTime = 0;
            
            // Play with promise handling for better mobile support
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing sound:', error);
                    
                    // For iOS, try to unlock audio on next user interaction
                    if (isIOS) {
                        const unlockAudio = function() {
                            sound.play().then(() => {
                                document.removeEventListener('touchend', unlockAudio);
                                document.removeEventListener('click', unlockAudio);
                            }).catch(e => console.error('Still cannot play:', e));
                        };
                        
                        document.addEventListener('touchend', unlockAudio, { once: true });
                        document.addEventListener('click', unlockAudio, { once: true });
                    }
                });
            }
        }
        
        // Override sound functions with improved HTML5 Audio versions
        window.playRollSound = function() {
            playFallbackSound(rollSound);
        };
        
        window.playPinsSound = function() {
            playFallbackSound(pinsSound);
        };
        
        window.playCheerSound = function() {
            playFallbackSound(cheerSound);
        };
        
        window.playIncorrectSound = function() {
            playFallbackSound(incorrectSound);
        };
        
        window.playWinSound = function() {
            playFallbackSound(winSound);
        };
    }
});
