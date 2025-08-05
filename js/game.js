// Number Bond Bowling Game - Game Logic
document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const rollButton = document.getElementById('roll-button');
    const checkAnswerButton = document.getElementById('check-answer-button');
    const startGameButton = document.getElementById('start-game-button');
    const playAgainButton = document.getElementById('play-again-button');
    const pinsContainer = document.getElementById('pins-container');
    const numberBondContainer = document.getElementById('number-bond-container');
    const answerContainer = document.getElementById('answer-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const startModal = document.getElementById('start-modal');
    const endModal = document.getElementById('end-modal');
    const currentRoundDisplay = document.getElementById('current-round');
    const answerInput = document.getElementById('answer-input');
    const numberButtonsContainer = document.getElementById('number-buttons');
    const numberBondsRecap = document.getElementById('number-bonds-recap');
    
    // Sound functions will be defined in sounds.js
    // These will be available as global functions:
    // playRollSound(), playPinsSound(), playCheerSound(), playIncorrectSound(), playWinSound()
    
    // Display elements
    const totalPinsDisplay = document.getElementById('total-pins');
    const pinsDownDisplay = document.getElementById('pins-down');
    const pinsRemainingDisplay = document.getElementById('pins-remaining');
    const totalPinsEqDisplay = document.getElementById('total-pins-eq');
    const pinsDownEqDisplay = document.getElementById('pins-down-eq');
    const pinsRemainingEqDisplay = document.getElementById('pins-remaining-eq');
    
    // Game state
    let gameState = {
        currentRound: 1,
        totalRounds: 10,
        totalPins: 10,
        pinsDown: 0,
        pinsRemaining: 10,
        gameActive: false,
        numberBondPairs: [],
        canRoll: true
    };
    
    // Show start modal when page loads
    startModal.classList.add('visible');
    
    // Initialize game
    function initGame() {
        startModal.classList.remove('visible');
        gameState.gameActive = true;
        gameState.currentRound = 1;
        gameState.numberBondPairs = [];
        updateRoundDisplay();
        setupRound();
    }
    
    // Setup a new round
    function setupRound() {
        // Reset game state
        gameState.canRoll = true;
        
        // Randomly select total pins (6-10)
        gameState.totalPins = Math.floor(Math.random() * 5) + 6;
        gameState.pinsRemaining = gameState.totalPins;
        gameState.pinsDown = 0;
        
        // Update displays
        totalPinsDisplay.textContent = gameState.totalPins;
        pinsDownDisplay.textContent = '0';
        pinsRemainingDisplay.textContent = '?';
        totalPinsEqDisplay.textContent = gameState.totalPins;
        pinsDownEqDisplay.textContent = '0';
        pinsRemainingEqDisplay.textContent = '?';
        
        // Hide number bond and answer containers
        numberBondContainer.classList.remove('visible');
        answerContainer.classList.remove('visible');
        
        // Clear feedback
        feedbackMessage.classList.remove('show', 'correct', 'incorrect');
        feedbackMessage.textContent = '';
        
        // Clear answer input
        answerInput.value = '';
        
        // Setup pins
        setupPins();
        
        // Setup number buttons
        setupNumberButtons();
        
        // Enable roll button
        rollButton.disabled = false;
    }
    
    // Setup number buttons for input
    function setupNumberButtons() {
        // Clear existing buttons
        numberButtonsContainer.innerHTML = '';
        
        // Create buttons 1-10
        for (let i = 0; i <= 10; i++) {
            const button = document.createElement('button');
            button.className = 'number-button';
            button.textContent = i;
            button.dataset.value = i;
            
            // Add click event with auto-validation
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                document.querySelectorAll('.number-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Update hidden input value
                answerInput.value = i;
                
                // Auto-validate the answer
                checkAnswer();
            });
            
            numberButtonsContainer.appendChild(button);
        }
    }
    
    // Setup pins based on total pins
    function setupPins() {
        // Clear existing pins
        pinsContainer.innerHTML = '';
        
        // Create pin arrangement based on total pins
        const pinPositions = getPinPositions(gameState.totalPins);
        
        // Create pins
        for (let i = 0; i < gameState.totalPins; i++) {
            const pin = document.createElement('div');
            pin.className = 'pin';
            pin.id = `pin-${i+1}`;
            pin.style.left = `${pinPositions[i].x}px`;
            pin.style.top = `${pinPositions[i].y}px`;
            pinsContainer.appendChild(pin);
        }
    }
    
    // Get pin positions based on total pins
    function getPinPositions(totalPins) {
        const positions = [];
        
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 768;
        
        // Adjust spacing for mobile
        const spacing = isMobile ? 20 : 30;
        const rowSpacing = isMobile ? 20 : 25;
        
        // Calculate center point
        const centerX = isMobile ? 85 : 85;
        
        // Different arrangements based on number of pins
        if (totalPins === 10) {
            // Classic triangle arrangement - better aligned for mobile
            positions.push({x: centerX, y: 0});  // Front pin
            positions.push({x: centerX - spacing/2, y: rowSpacing}); 
            positions.push({x: centerX + spacing/2, y: rowSpacing}); // Second row
            positions.push({x: centerX - spacing, y: rowSpacing*2}); 
            positions.push({x: centerX, y: rowSpacing*2}); 
            positions.push({x: centerX + spacing, y: rowSpacing*2}); // Third row
            positions.push({x: centerX - spacing*1.5, y: rowSpacing*3}); 
            positions.push({x: centerX - spacing/2, y: rowSpacing*3}); 
            positions.push({x: centerX + spacing/2, y: rowSpacing*3}); 
            positions.push({x: centerX + spacing*1.5, y: rowSpacing*3}); // Fourth row
        } else if (totalPins === 9) {
            // 3-3-3 arrangement
            positions.push({x: centerX - spacing, y: 0}); 
            positions.push({x: centerX, y: 0}); 
            positions.push({x: centerX + spacing, y: 0}); // First row
            positions.push({x: centerX - spacing, y: rowSpacing}); 
            positions.push({x: centerX, y: rowSpacing}); 
            positions.push({x: centerX + spacing, y: rowSpacing}); // Second row
            positions.push({x: centerX - spacing, y: rowSpacing*2}); 
            positions.push({x: centerX, y: rowSpacing*2}); 
            positions.push({x: centerX + spacing, y: rowSpacing*2}); // Third row
        } else if (totalPins === 8) {
            // 2-3-3 arrangement
            positions.push({x: centerX - spacing/2, y: 0}); 
            positions.push({x: centerX + spacing/2, y: 0}); // First row
            positions.push({x: centerX - spacing, y: rowSpacing}); 
            positions.push({x: centerX, y: rowSpacing}); 
            positions.push({x: centerX + spacing, y: rowSpacing}); // Second row
            positions.push({x: centerX - spacing, y: rowSpacing*2}); 
            positions.push({x: centerX, y: rowSpacing*2}); 
            positions.push({x: centerX + spacing, y: rowSpacing*2}); // Third row
        } else if (totalPins === 7) {
            // 2-2-3 arrangement
            positions.push({x: centerX - spacing/2, y: 0}); 
            positions.push({x: centerX + spacing/2, y: 0}); // First row
            positions.push({x: centerX - spacing/2, y: rowSpacing}); 
            positions.push({x: centerX + spacing/2, y: rowSpacing}); // Second row
            positions.push({x: centerX - spacing, y: rowSpacing*2}); 
            positions.push({x: centerX, y: rowSpacing*2}); 
            positions.push({x: centerX + spacing, y: rowSpacing*2}); // Third row
        } else if (totalPins === 6) {
            // 2-2-2 arrangement
            positions.push({x: centerX - spacing/2, y: 0}); 
            positions.push({x: centerX + spacing/2, y: 0}); // First row
            positions.push({x: centerX - spacing/2, y: rowSpacing}); 
            positions.push({x: centerX + spacing/2, y: rowSpacing}); // Second row
            positions.push({x: centerX - spacing/2, y: rowSpacing*2}); 
            positions.push({x: centerX + spacing/2, y: rowSpacing*2}); // Third row
        }
        
        return positions;
    }
    
    // Roll the bowling ball
    function rollBall() {
        if (!gameState.canRoll) return;
        
        // Disable roll button
        rollButton.disabled = true;
        gameState.canRoll = false;
        
        // Play roll sound
        if (window.playRollSound) playRollSound();
        
        // Create and animate bowling ball
        const ball = document.createElement('div');
        ball.className = 'bowling-ball';
        pinsContainer.appendChild(ball);
        
        // Animate ball
        setTimeout(() => {
            ball.classList.add('rolling');
            
            // Calculate pins to knock down (between 0 and totalPins)
            const minPins = 0;
            const maxPins = gameState.totalPins;
            gameState.pinsDown = Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins;
            gameState.pinsRemaining = gameState.totalPins - gameState.pinsDown;
            
            // After ball reaches pins
            setTimeout(() => {
                // Play pins sound if pins were knocked down
                if (gameState.pinsDown > 0 && window.playPinsSound) {
                    playPinsSound();
                }
                
                // Knock down random pins
                knockDownPins(gameState.pinsDown);
                
                // Update number bond display
                updateNumberBond();
                
                // Show number bond and answer containers
                setTimeout(() => {
                    numberBondContainer.classList.add('visible');
                    answerContainer.classList.add('visible');
                    
                    // Remove ball after animation
                    setTimeout(() => {
                        ball.remove();
                    }, 500);
                }, 1000);
            }, 1000);
        }, 100);
    }
    
    // Knock down pins
    function knockDownPins(count) {
        const pins = document.querySelectorAll('.pin');
        const pinIndices = Array.from({length: pins.length}, (_, i) => i);
        
        // Shuffle array to randomly select pins to knock down
        for (let i = pinIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pinIndices[i], pinIndices[j]] = [pinIndices[j], pinIndices[i]];
        }
        
        // Knock down the selected pins
        for (let i = 0; i < count; i++) {
            pins[pinIndices[i]].classList.add('fallen');
        }
    }
    
    // Update number bond display
    function updateNumberBond() {
        pinsDownDisplay.textContent = gameState.pinsDown;
        pinsDownEqDisplay.textContent = gameState.pinsDown;
    }
    
    // Check the player's answer
    function checkAnswer() {
        const playerAnswer = parseInt(answerInput.value);
        
        if (isNaN(playerAnswer)) {
            // No answer provided
            feedbackMessage.textContent = "Please enter a number!";
            feedbackMessage.className = "show incorrect";
            return;
        }
        
        if (playerAnswer === gameState.pinsRemaining) {
            // Correct answer
            feedbackMessage.textContent = getRandomPositiveFeedback();
            feedbackMessage.className = "show correct";
            
            // Play cheer sound
            if (window.playCheerSound) playCheerSound();
            
            // Update displays
            pinsRemainingDisplay.textContent = gameState.pinsRemaining;
            pinsRemainingEqDisplay.textContent = gameState.pinsRemaining;
            
            // Record the number bond pair
            gameState.numberBondPairs.push({
                total: gameState.totalPins,
                part1: gameState.pinsDown,
                part2: gameState.pinsRemaining
            });
            
            // Move to next round after a delay
            setTimeout(() => {
                gameState.currentRound++;
                
                // Check if game is over
                if (gameState.currentRound > gameState.totalRounds) {
                    endGame();
                    return; // Make sure we don't continue to next round
                } else {
                    updateRoundDisplay();
                    setupRound();
                }
            }, 2000);
        } else {
            // Incorrect answer
            feedbackMessage.textContent = "Try again!";
            feedbackMessage.className = "show incorrect";
            
            // Play incorrect sound
            if (window.playIncorrectSound) playIncorrectSound();
            
            // Clear input for another try
            answerInput.value = '';
            answerInput.focus();
        }
    }
    
    // Update round display
    function updateRoundDisplay() {
        currentRoundDisplay.textContent = gameState.currentRound;
    }
    
    // End the game
    function endGame() {
        // Play win sound
        if (window.playWinSound) playWinSound();
        
        // Populate recap
        populateRecap();
        
        // Show end modal
        endModal.classList.add('visible');
    }
    
    // Populate number bonds recap
    function populateRecap() {
        numberBondsRecap.innerHTML = '';
        
        // Sort number bonds by total and then by first number
        const sortedBonds = [...gameState.numberBondPairs].sort((a, b) => {
            if (a.total !== b.total) return a.total - b.total;
            return a.first - b.first;
        });
        
        // Create unique pairs (remove duplicates)
        const uniquePairs = [];
        sortedBonds.forEach(bond => {
            if (!uniquePairs.some(p => p.first === bond.first && p.second === bond.second && p.total === bond.total)) {
                uniquePairs.push(bond);
            }
        });
        
        // Create elements for each unique pair
        uniquePairs.forEach(bond => {
            const pairElement = document.createElement('div');
            pairElement.className = 'bond-pair';
            pairElement.textContent = `${bond.first} + ${bond.second} = ${bond.total}`;
            numberBondsRecap.appendChild(pairElement);
        });
    }
    
    // Get random positive feedback
    function getRandomPositiveFeedback() {
        const feedback = [
            "Strike!",
            "Great job!",
            "You're a number bond pro!",
            "Perfect!",
            "Amazing!",
            "Fantastic!",
            "Awesome!",
            "You got it!",
            "Excellent!",
            "Superstar!"
        ];
        return feedback[Math.floor(Math.random() * feedback.length)];
    }
    
    // Event listeners
    rollButton.addEventListener('click', rollBall);
    checkAnswerButton.addEventListener('click', checkAnswer);
    startGameButton.addEventListener('click', initGame);
    playAgainButton.addEventListener('click', () => {
        // Hide end modal
        endModal.classList.remove('visible');
        // Start new game
        initGame();
    });
    
    // Allow Enter key to submit answer
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
});
