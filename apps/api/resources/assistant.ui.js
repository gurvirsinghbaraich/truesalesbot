const messages = [];
const botApiEndpoint = "http://localhost:8675/assistant";
const iconsEndpoint =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0";

function loadIcons(iframeDoc) {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.setAttribute("href", iconsEndpoint);
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("async", "true");
    link.onload = resolve;

    document.head.appendChild(link);
    iframeDoc.head.appendChild(link.cloneNode());
  });
}

function loadAssistantUi(name, iframeDoc) {
  console.log("Loading assistant UI...");
  const assistantUi = `
    <div class="assistant-ui">
      <header>
        <h2>${name}</h2>
        <span class="material-symbols-outlined">close</span>
      </header>

      <ul class="assistant-ui-list">
      </ul>

      <div class="assistant-message-input">
        <input autofocus placeholder="Enter a message..." required></input>
        <span id="send-message" class="material-symbols-outlined">send</span>
      </div>
    </div>
  `;

  iframeDoc.body.innerHTML += assistantUi;
}

function loadAssistantStyles(iframeDoc) {
  const assistantStyles = iframeDoc.createElement("style");

  assistantStyles.innerHTML = `
    * {
      font-family: Poppins, sans-serif;
      list-style: none;
    }

    .assistant-ui-questions {
      padding-left: 42px;
      padding-top: 10px;
      margin-right: 20px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .assistant-ui-question:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
    
    .assistant-ui-question {
      width: 100%;
      text-align: left;
      padding: 10px 20px;
      background: var(--assistant-ui-accent-color);
      color: var(--assistant-ui-text-color);
      border-radius: 10px;
      cursor: pointer;
      border: none;
      outline: none;
    }

    .assistant-ui {
      position: fixed;
      right: 40px;
      bottom: 100px;
      width: 420px;
      background: var(--assistant-ui-background-color);
      border-radius: 15px;
      transform: scale(0.5);
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      box-shadow: 0 0 128px 0 rgba(0,0,0,0.1)
                  0 32px 64px -48px rgba(0,0,0,0.5)
    }

    .assistant-ui-visible .assistant-ui {
      transform: scale(1);
      opacity: 1;
      pointer-events: auto;
    }
    
    .assistant-ui header {
      background: var(--assistant-ui-accent-color);
      position: relative;
      padding: 16px 0;
      text-align: center;
      color: var(--assistant-ui-text-color);
    }
    
    .assitant-ui header h2 {
      color: var(--assistant-ui-text-color);
      font-size: 1.4rem;
    }

    .assistant-ui header span {
      position: absolute;
      right: 20px;
      top: 50%;
      color: var(--assistant-ui-text-color);
      cursor: pointer;
      transform: translateY(-50%);
      display: none;
    }
    
    .assistant-ui-list {
      height: 510px;
      overflow-y: auto;
      padding: 30px 20px 70px;
    }
    
    .assistant-ui-list .message-container {
      display: flex;
    }

    .assistant-ui .message-container span {
      height: 32px;
      width: 32px;
      color: var(--assistant-ui-text-color);
      background: var(--assistant-ui-accent-color);
      text-align: center;
      line-height: 32px;
      border-radius: 4px;
      margin: 0 10px 7px 0;
      align-self: flex-end;
    }
    
    .message {
      margin: 0 !important;
    }
    
    .assistant-ui .message-container.user {
      margin: 20px 0;
      justify-content: flex-end;
    }

    .assistant-ui .message {
      color: var(--assistant-ui-text-color);
      font-size: 0.95rem;
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 10px 10px 0 10px;
      background: var(--assistant-ui-accent-color);
    }

    .assistant-ui .message.outgoing {
      font-size: 13.3px;
    }

    .assistant-ui .message.incoming {
      color: #000;
      background: #f2f2f2;
      border-radius: 10px 10px 10px 0px;
    }

    .assistant-message-input {
      position: absolute;
      bottom: 0;
      width: 100%;
      display: flex;
      gap: 5px;
      background: var(--assistant-ui-background-color);
      padding: 5px 20px;
      border-top: 1px solid #ccc;
    }

    .assistant-message-input input {
      border: none;
      height: 55px;
      outline: none;
      width: 100%;
      font-family: inherit;
      font-size: 0.95rem;
      resize: none;
      padding: 16px 15px 16px 0;
    }

    .assistant-message-input #send-message {
      color: var(--assistant-ui-accent-color);
      cursor: pointer;
      align-self: flex-end;
      line-height: 55px;
      font-size: 1.35rem;
      height: 55px;
      visibility: hidden;
    }
    
    .assistant-message-input input:valid ~ #send-message {
      visibility: visible;
    }
    
    .assistant-ui hr {
      border: transparent;
      padding: 0;
      margin: -0.5rem;
    }

    @media(max-width: 490px) {
      .assistant-ui-toggle {
        right: 25px;
        bottom: 25px;
      }

      .assistant-ui {
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
      }

      .assistant-ui .assistant-ui-list {
        height: 90%;
      }

      .assistant-ui header span {
        display: block;
      }
    }
  `;

  iframeDoc.head.append(assistantStyles);
}

function generateUid() {
  return "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/[x]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return r.toString(16);
  });
}

async function sendMessage(
  messageContent,
  messagesContainer,
  { botId, questions }
) {
  if (Array.isArray(questions)) {
    questions.map((question) => {
      question.disabled = true;
    });
  }

  const messageId = generateUid();

  messages.push({
    role: "user",
    id: messageId,
    content: messageContent,
  });

  // Create the user message element
  const userMessageElement = document.createElement("li");
  userMessageElement.setAttribute("data-message-id", messageId);
  userMessageElement.classList.add("message-container", "user");
  userMessageElement.innerHTML = `
    <p class="message outgoing">${messageContent}</p>
  `;
  // Append user message to messages container
  messagesContainer.appendChild(userMessageElement);

  userMessageElement.scrollIntoView({
    behavior: "smooth",
  });

  try {
    const assistantMessageId = generateUid();

    // Create the thinking message element
    const thinkingMessageElement = document.createElement("li");
    thinkingMessageElement.setAttribute("data-message-id", assistantMessageId);
    thinkingMessageElement.innerHTML = `
      <div class="message-container assistant">
        <span class="material-symbols-outlined">smart_toy</span>
        <p class="message incoming">Thinking...</p>
      </div>
      <div class="assistant-ui-questions"></div>
    `;
    // Append thinking message to messages container
    messagesContainer.appendChild(thinkingMessageElement);

    thinkingMessageElement.scrollIntoView({
      behavior: "smooth",
    });

    const request = await fetch(`${botApiEndpoint}/${botId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map(({ role, content }) => ({
          role,
          content,
        })),
      }),
    });

    const data = request.body;

    const reader = data.getReader();
    const decoder = new TextDecoder("UTF-8");

    let assistantMessageParsed = "";
    let assistantMessageContent = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      assistantMessageContent += decoder.decode(value);

      try {
        const parsed = JSON.parse(
          JSONRepair.jsonrepair(assistantMessageContent.replace(/\n/g, ""))
        );

        assistantMessageParsed = parsed?.response || "";

        if (parsed?.q) {
          const questionsContainer = thinkingMessageElement.querySelector(
            ".assistant-ui-questions"
          );
          questionsContainer.innerHTML = "";

          const questions = parsed.q?.map((question) => {
            const questionElement = document.createElement("button");
            questionElement.classList.add("assistant-ui-question");
            questionElement.innerHTML = question;
            questionsContainer.appendChild(questionElement);

            return questionElement;
          });

          questions.map((question) => {
            question.onclick = () => {
              sendMessage(question.innerHTML, messagesContainer, {
                botId,
                questions,
              });
            };
          });
        }
      } catch (error) {}

      thinkingMessageElement.querySelector("p").innerHTML = marked.parse(
        assistantMessageParsed
      );

      thinkingMessageElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  } catch (error) {
    console.error(error?.message);
  }
}

async function loadActions(botId, iframeDoc, iframe) {
  const assistantUiToggle = document.querySelector(".assistant-ui-toggle");

  const assistantCloseIcon = iframeDoc.querySelector(
    ".assistant-ui header span"
  );
  const assistantMessagesContainer = iframeDoc.querySelector(
    ".assistant-ui .assistant-ui-list"
  );
  const assistantMessageBox = iframeDoc.querySelector(
    ".assistant-ui .assistant-message-input input"
  );
  const assistantMessageBoxSendButton = iframeDoc.querySelector(
    ".assistant-ui .assistant-message-input #send-message"
  );

  assistantUiToggle.addEventListener("click", () => {
    document.body.classList.toggle("assistant-ui-visible");
    iframeDoc.body.classList.toggle("assistant-ui-visible");

    if (iframe.style.display == "block") {
      iframe.style.display = "none";
    } else {
      iframe.style.display = "block";
    }
  });

  assistantCloseIcon.addEventListener("click", () => {
    document.body.classList.remove("assistant-ui-visible");
    iframeDoc.body.classList.remove("assistant-ui-visible");
  });

  assistantMessageBox.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage(assistantMessageBox.value, assistantMessagesContainer, {
        botId,
      });

      assistantMessageBox.value = "";
    }
  });

  assistantMessageBoxSendButton.addEventListener("click", () => {
    sendMessage(assistantMessageBox.value, assistantMessagesContainer, {
      botId,
    });

    assistantMessageBox.value = "";
  });

  sendMessage("Hi", assistantMessagesContainer, { botId });

  const messageId = messages[0].id;
  const messageElement = iframeDoc.querySelector(
    `[data-message-id="${messageId}"]`
  );

  assistantMessagesContainer.removeChild(messageElement);
}

async function loadAssistantSettings(botId, iframeDoc) {
  const response = await fetch(`${botApiEndpoint}/${botId}`);
  const assistantSettings = await response.json();

  const styles = `
    <style>
      :root {
        --assistant-ui-text-color: ${assistantSettings.textColor};
        --assistant-ui-accent-color: ${assistantSettings.accentColor};
        --assistant-ui-background-color: ${assistantSettings.backgroundColor};
      }
    </style>
  `;

  iframeDoc.head.innerHTML += styles;
  document.head.innerHTML += styles;

  return assistantSettings;
}

async function initialize(botConfig) {
  const { botId } = botConfig;

  if (!botId || typeof botId !== "string" || !isNaN(+botId)) {
    throw new Error("botId is required and must be a string");
  }
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.top = "0";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  await loadIcons(iframeDoc);

  // Create the assistant-ui-toggle in the main document
  const toggleButton = document.createElement("div");
  toggleButton.classList.add("assistant-ui-toggle");
  toggleButton.innerHTML = `
    <span class="material-symbols-outlined">mode_comment</span>
    <span class="material-symbols-outlined">close</span>
  `;

  document.body.appendChild(toggleButton);

  const assistantToggleStyles = document.createElement("style");
  assistantToggleStyles.innerHTML = `
    .assistant-ui-toggle {
      position: fixed;
      right: 35px;
      bottom: 35px;
      height: 50px;
      width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--assistant-ui-text-color);
      border: none;
      outline: none;
      background: var(--assistant-ui-accent-color);
      border-radius: 50%;
      cursor: pointer;
      z-index: 10000;
      transition: none !important;
    }
    
    .assistant-ui-toggle span {
      position: absolute;
      transition: none !important;
    }
    
    .assistant-ui-toggle span:last-child {
      opacity: 0;
      transition: none !important;
    }
    
    .assistant-ui-visible .assistant-ui-toggle span:last-child {
      opacity: 1;
      transition: none !important;
    }
    
    .assistant-ui-visible .assistant-ui-toggle span:first-child {
      opacity: 0;
      transition: none !important;
    }
    `;

  // Create an iframe

  const { name } = await loadAssistantSettings(botId, iframeDoc);
  document.head.appendChild(assistantToggleStyles);

  loadAssistantStyles(iframeDoc);
  loadAssistantUi(name, iframeDoc);
  loadActions(botId, iframeDoc, iframe);

  console.log("Assistant initialized successfully!");
}

export const getDomainSignedAPIKey = async function () {
  const textUnit8 = new TextEncoder().encode(window.location.host);
  const hashBuffer = await crypto.subtle.digest("SHA-256", textUnit8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

export class Assistant {
  constructor(botConfig) {
    initialize(botConfig);
  }
}
