function sendMessage() {
    var userInput = document.getElementById('user-input');
    var userMessage = userInput.value;

    if (userMessage.trim() === '') {
        return;
    }

    var chatBox = document.getElementById('chat-box');

    // Append user message to chat box
    var userDiv = document.createElement('div');
    userDiv.className = 'chat-message user-message';
    userDiv.innerHTML = '<span class="user-name">You:</span> <span class="message">' + userMessage + '</span>';
    chatBox.appendChild(userDiv);

    // Simulate bot response (you can replace this with actual bot logic)
    setTimeout(function() {
        API_query(userMessage, chatBox);
    }, 500);

    // Clear input field
    userInput.value = '';
}
document.getElementById("user-input").addEventListener("keydown", (event) => {
    if(`${event.code}` === "Enter") {
        sendMessage();
    }
});

function API_query (userMessage, chatBox) {
    fetch("http://127.0.0.1:5000/assistant", {
        method: "POST",
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: userMessage
        })
    }).then((response) => response.json())
    .then((response) => {
        let responseMessage = response.output;
        let botDiv = document.createElement('div');
        botDiv.className = 'chat-message bot-message';
        botDiv.innerHTML = `<span class="bot-name">SwiftMate:</span> <span class="message">${responseMessage}</span>`;
        chatBox.appendChild(botDiv);

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}