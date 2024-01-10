import { postMessages } from "./post_messages.js";

window.onload = function () {
  const btn = document.getElementById("send-btn");
  btn.addEventListener("click", sendMessage);
  console.log("Onloadd....");
};

// Pocetna poruka dijaloga sa openai
const messages = [];
// messages.push({
//   role: "system",
//   content: `Today is ${new Date()}`,
// });

/******************************************************************
 * Slanje upita ka serveru i azuriranje korisnickog interfejsa
 *
 */
async function sendMessage() {
  const messageInput = document.getElementById("message-input");
  let chatBox = document.getElementById("chat-box-1");

  // Get the user's message
  let msg = messageInput.value;
  messages.push({ role: "user", content: msg });
  console.log(messages);

  // Append the user's message to the chat box
  chatBox.innerHTML += `<p><strong>user :</strong> ${msg} </p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  // // ChatGPT response
  const url = window.location.href + "openai/chat";
  let gptResponse = await postMessages(url, messages);

  // add the answer to the dialogue
  messages.push(gptResponse);

  // Append the gpt's message to the chat box
  chatBox.innerHTML += `<p><strong>${gptResponse.role}:</strong> <pre> ${gptResponse.content} </pre> </p>`;
  // Scroll to the bottom of the chat box to show the latest message
  chatBox.scrollTop = chatBox.scrollHeight;

  // Clear the input field
  messageInput.value = "";

  // write to log
  console.log("Dialog : ", messages);
}
