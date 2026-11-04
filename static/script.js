
const display = document.getElementById("display");
const statusText = document.getElementById("status");
const micButton = document.getElementById("mic-button");

let currentExpression = "";

// Add number or operator
function addValue(value) {

    if (currentExpression === "0") {
        currentExpression = "";
    }

    currentExpression += value;
    display.value = currentExpression;
}

// Clear calculator
function clearDisplay() {

    currentExpression = "";
    display.value = "0";
    statusText.innerText = "Calculator cleared";
}

// Delete last character
function deleteLast() {

    currentExpression = currentExpression.slice(0, -1);

    display.value = currentExpression || "0";
}

// Calculate result
function calculate() {

    try {

        if (!currentExpression) {
            return;
        }

        // Allow only calculator characters
        if (!/^[0-9+\-*/%.()\s]+$/.test(currentExpression)) {
            throw new Error("Invalid calculation");
        }

        let result = Function(
            '"use strict"; return (' + currentExpression + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        display.value = result;
        currentExpression = String(result);

        statusText.innerText = "Calculation completed";

        speak("The answer is " + result);

    } catch (error) {

        display.value = "Error";
        currentExpression = "";

        statusText.innerText = "Please enter a valid calculation";
        speak("Please enter a valid calculation");
    }
}

// Speak answer
function speak(message) {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(message);

        speech.lang = "en-IN";
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
    }
}

// Voice recognition
function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        statusText.innerText =
            "Voice recognition is not supported. Try Chrome.";

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    statusText.innerText = "Listening... Speak now";
    micButton.innerText = "🎙 Listening...";

    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript.toLowerCase();

        statusText.innerText = "You said: " + transcript;

        processVoiceCommand(transcript);
    };

    recognition.onerror = function(event) {

        statusText.innerText = "Voice error: " + event.error;
        micButton.innerText = "🎤 Speak";
    };

    recognition.onend = function() {

        micButton.innerText = "🎤 Speak";
    };

    recognition.start();
}

// Understand voice commands
function processVoiceCommand(command) {

    command = command
        .replace(/plus/g, "+")
        .replace(/add/g, "+")
        .replace(/minus/g, "-")
        .replace(/subtract/g, "-")
        .replace(/multiplied by/g, "*")
        .replace(/multiply/g, "*")
        .replace(/times/g, "*")
        .replace(/divided by/g, "/")
        .replace(/divide/g, "/")
        .replace(/over/g, "/")
        .replace(/percent/g, "%")
        .replace(/x/g, "*")
        .replace(/[^0-9+\-*/%. ]/g, "")
        .trim();

    if (command) {

        currentExpression = command;
        display.value = command;

        calculate();

    } else {

        statusText.innerText = "Sorry, I couldn't understand.";

        speak("Sorry, I couldn't understand your calculation.");
    }
}
