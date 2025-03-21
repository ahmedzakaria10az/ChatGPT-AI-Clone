const API_CONFIG = {
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "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", 
    model: "gpt-4o-mini",
};

const chatMessages = document.querySelector(".chat-messages");
const textarea = document.querySelector("textarea");
const chatHistoryList = document.querySelector(".chat-history");
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
let chatCounter = chatHistory.length + 1;

window.onload = () => {
    loadChatHistoryList();
    if (chatHistory.length > 0) {
        loadChatHistory(chatHistory[chatHistory.length - 1].title);
    } else {
        startNewChat();
    }
};

async function sendMessage() {
    const userMessage = textarea.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, "user");
    showLoading();

    try {
        const response = await fetch(API_CONFIG.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_CONFIG.apiKey}`,
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 150,
            }),
        });

        if (!response.ok) throw new Error("API Response Error");
        const data = await response.json();
        addMessage(data.choices[0].message.content, "assistant");
    } catch (error) {
        console.error("An error occurred:", error);
        addMessage("There was an error connecting to the server. Try again.", "error");
    } finally {
        hideLoading();
        textarea.value = "";
    }
}

function addMessage(content, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<div class="content">${content}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showLoading() {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading";
    loadingIndicator.textContent = "Writing...";
    loadingIndicator.id = "loadingIndicator";
    chatMessages.appendChild(loadingIndicator);
}

function hideLoading() {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) chatMessages.removeChild(loadingIndicator);
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startNewChat() {
    if (chatMessages.children.length > 1) {
        saveChatHistory();
    }
    chatMessages.innerHTML = "";
    addMessage("Hello! How can I help you today?", "assistant");
}

function saveChatHistory() {
    const chatContent = chatMessages.innerHTML;
    const chatTitle = `Previous Chat ${chatCounter}`;
    chatHistory.push({ title: chatTitle, content: chatContent });

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    addChatToHistoryList(chatTitle);
    chatCounter++;
}

function addChatToHistoryList(title) {
    const listItem = document.createElement("li");
    listItem.textContent = title;
    listItem.addEventListener("click", () => loadChatHistory(title));
    chatHistoryList.appendChild(listItem);
}

function loadChatHistoryList() {
    chatHistoryList.innerHTML = "";
    chatHistory.forEach((chat) => addChatToHistoryList(chat.title));
}

function loadChatHistory(title) {
    const selectedChat = chatHistory.find((chat) => chat.title === title);
    if (selectedChat) {
        chatMessages.innerHTML = selectedChat.content;
        scrollToBottom();
    }
}

function clearChatHistory() {
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    chatHistoryList.innerHTML = "";
    startNewChat();
}

function logout() {
    alert("Logged out successfully!");
}

textarea.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
})

startNewChat();