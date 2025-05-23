        // Ensure the DOM is fully loaded before running the script
        document.addEventListener('DOMContentLoaded', () => {
            // Create an Audio object for the sound effect
            // Using a very short, simple tone. You can replace this with your own sound file.
            // For a spammable effect, ensure the sound is short and can be played rapidly.
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let oscillator = null;

            function playDenySound() {
                // Stop any existing oscillator to allow rapid re-triggering
                if (oscillator) {
                    oscillator.stop();
                    oscillator.disconnect();
                }

                oscillator = audioContext.createOscillator();
                oscillator.type = 'sine'; // Sine wave for a clean tone
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note (440 Hz)

                const gainNode = audioContext.createGain();
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Volume control
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1); // Quick fade out

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1); // Play for 0.1 seconds
            }

            // Push a new state to the history when the page loads.
            // This creates an extra entry in the history stack, so when the user
            // presses back, they go to this "dummy" state instead of leaving the page.
            // The state object can be empty or contain data.
            history.pushState({ page: 'stuck_page' }, document.title, window.location.href);

            // Listen for the 'popstate' event. This event fires when the active history
            // entry changes, typically when the user presses the back/forward buttons.
            window.addEventListener('popstate', (event) => {
                // Check if the user is trying to go back to a state we don't want them to.
                // In this setup, any 'popstate' means they tried to go back.
                // We immediately push a new state again to effectively "trap" them.
                history.pushState({ page: 'stuck_page' }, document.title, window.location.href);

                // Play the sound effect
                playDenySound();

                // Optional: You can also display a message to the user
                // For this example, we'll just rely on the sound and the page not changing.
                console.log("Back button pressed! Denied navigation and played sound.");
            });

            // Prevent unwanted behavior if the user tries to navigate away through other means (e.g., closing tab)
            // This is less about preventing back and more about preventing unload generally.
            window.addEventListener('beforeunload', (event) => {
                // Most browsers will ignore custom messages for beforeunload and show a generic one.
                // Returning a string here prompts the browser to ask the user for confirmation.
                // This is often used for unsaved changes, not for trapping.
                event.preventDefault();
                event.returnValue = ''; // Standard way to trigger the confirmation prompt
            });
        });
