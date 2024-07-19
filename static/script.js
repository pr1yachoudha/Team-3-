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
    }, 1000);

    // Clear input field
    userInput.value = '';
}

function sendFile() {
    var fileInput = document.getElementById('input-file');
    const file = fileInput.files[0];    

    if (!file) {
        alert('Please select a file!');
        return;
    }

    const formData = new FormData();
    formData.append('uploadedFile', file);
    formData.append('filename', document.getElementById('input-file').value.split("\\").pop());
    fileInput.value = null;

    fetch('http://127.0.0.1:5000/files', { 
        method: 'POST',
        body: formData
    }).then(response => {
        var chatBox = document.getElementById('chat-box');
        var userDiv = document.createElement('div');
        userDiv.className = 'chat-message user-message';
        if (response.ok) {
            userDiv.innerHTML = '<span class="user-name"></span> <span class="message">File successfully uploaded</span>';
        } else {
            userDiv.innerHTML = '<span class="user-name"></span> <span class="message">Failed to upload file</span>';
        }
        chatBox.appendChild(userDiv);
    })
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
        botDiv.innerHTML = `<span class="bot-name">SWIFTMate:</span> <span class="message">${responseMessage}</span>`;
        chatBox.appendChild(botDiv);

        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}