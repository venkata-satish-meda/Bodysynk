/* ================================
   SYNKI - BODY SYNK AI CHARACTER
   ================================ */

(function () {

    // Prevent Synki from being created twice
    if (document.getElementById("synki")) return;

    const synki = document.createElement("div");

    synki.id = "synki";

    synki.innerHTML = `
        <div class="synki-bubble" id="synkiBubble">
            Heyyy! 👋 I'm Synki.
        </div>

        <div class="synki-body">

            <div class="synki-glow"></div>

            <div class="synki-face">

                <div class="synki-eye left"></div>
                <div class="synki-eye right"></div>

                <div class="synki-mouth"></div>

            </div>

            <div class="synki-arm left"></div>
            <div class="synki-arm right"></div>

            <div class="synki-foot left"></div>
            <div class="synki-foot right"></div>

        </div>
    `;

    document.body.appendChild(synki);

    const bubble = document.getElementById("synkiBubble");
    const eyes = synki.querySelectorAll(".synki-eye");
    const chat = document.createElement("section");
    chat.id = "synkiChat";
    chat.setAttribute("role", "dialog");
    chat.setAttribute("aria-label", "Synki chat");
    chat.setAttribute("aria-hidden", "true");
    chat.innerHTML = `
        <header class="synki-chat-header">
            <div class="synki-chat-avatar"></div>
            <strong>Synki</strong>
            <button class="synki-chat-close" type="button" aria-label="Close chat">×</button>
        </header>
        <div class="synki-chat-messages" aria-live="polite"></div>
        <form class="synki-chat-form">
            <input class="synki-chat-input" type="text" placeholder="Ask me anything..." aria-label="Your message" autocomplete="off">
            <button class="synki-chat-send" type="submit">Send</button>
        </form>
    `;
    document.body.appendChild(chat);

    const messages = chat.querySelector(".synki-chat-messages");
    const chatInput = chat.querySelector(".synki-chat-input");
    let currentUser = null;
    let authChecked = false;
    let welcomeShown = false;

    function addChatMessage(text, fromSynki, showLogin, includeInHistory) {
        const row = document.createElement("div");
        row.className = `synki-chat-message ${fromSynki ? "synki-chat-reply" : "synki-chat-user"}`;
        row.dataset.aiMessage = String(Boolean(includeInHistory));
        if (fromSynki) {
            const avatar = document.createElement("span");
            avatar.className = "synki-chat-avatar";
            avatar.setAttribute("aria-hidden", "true");
            avatar.appendChild(synki.querySelector(".synki-body").cloneNode(true));
            row.appendChild(avatar);
        }

        const content = document.createElement("div");
        content.className = "synki-chat-content";
        const message = document.createElement("p");
        message.textContent = text;
        content.appendChild(message);
        if (showLogin) {
            [["Log in", "/login"], ["Sign up", "/signup"]].forEach(function ([label, path]) {
                const link = document.createElement("a");
                link.className = "synki-chat-login";
                link.href = path;
                link.textContent = label;
                content.appendChild(link);
            });
        }
        row.appendChild(content);
        messages.appendChild(row);
        messages.scrollTop = messages.scrollHeight;
    }

    let opened = false;
    let blinkTimer;
    let reactionTimer;
    let savedBubble;
    let idleTimer;
    let dragPointerId = null;
    let dragExpressionTimer;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartLeft = 0;
    let dragStartTop = 0;
    let dragTransition = "";
    let isDragging = false;
    let suppressClick = false;
    let dragBubbleState;

    function isBusy() {
        return opened || synki.matches(":hover") ||
            ["thinking", "confused", "responding", "excited", "dragging"].some(
                (state) => synki.classList.contains(state)
            );
    }

    function showWelcome() {
        if (!opened || welcomeShown || !authChecked) return;
        welcomeShown = true;
        if (currentUser) {
            addChatMessage(`Hey ${currentUser}! 👋 How can I help you today?`, true);
        } else {
            addChatMessage("Hi! 👋 I'm Synki. Please log in or sign up first, then I can chat with you.", true, true);
        }
    }

    async function checkLogin() {
        try {
            const response = await fetch("/api/session");
            if (!response.ok) throw new Error("Could not check login.");
            const result = await response.json();
            currentUser = result.authenticated && typeof result.username === "string"
                ? result.username
                : null;
        } catch (error) {
            currentUser = null;
            authChecked = true;
            if (opened && !welcomeShown) {
                welcomeShown = true;
                addChatMessage("I can't verify your login right now. Please try again in a moment.", true);
            }
            return;
        }
        authChecked = true;
        showWelcome();
    }

    function isLoggedIn() {
        return authChecked && currentUser !== null;
    }

    async function askAI(message, history) {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history })
        });
        if (!response.ok) throw new Error("The chat request failed.");
        const result = await response.json();
        if (typeof result.reply !== "string" || !result.reply.trim()) {
            throw new Error("The chat returned no reply.");
        }
        return result.reply;
    }

    checkLogin();

    function saveBubble() {
        return {
            text: bubble.textContent,
            shown: bubble.classList.contains("show")
        };
    }

    function restoreBubble(state) {
        if (!state) return;
        bubble.textContent = state.text;
        bubble.classList.toggle("show", state.shown || opened);
    }

    function scheduleBlink() {
        blinkTimer = window.setTimeout(function () {
            if (!isBusy()) {
                synki.classList.add("blinking");
                window.setTimeout(function () {
                    synki.classList.remove("blinking");
                }, 140);
            }
            scheduleBlink();
        }, 3000 + Math.random() * 3000);
    }

    scheduleBlink();

    function scheduleIdleReaction() {
        idleTimer = window.setTimeout(function () {
            if (!isBusy()) {
                const reaction = Math.floor(Math.random() * 3);
                const state = ["happy", "curious", "playful"][reaction];
                synki.classList.add(state);

                if (reaction === 2) {
                    const direction = Math.random() < 0.5 ? -1 : 1;
                    synki.style.setProperty("--synki-look-x", `${direction * 1.5}px`);
                    eyes.forEach((eye) => {
                        eye.style.setProperty("--synki-look-x", `${direction * 1.5}px`);
                        eye.style.setProperty("--synki-look-y", "-1px");
                    });
                }

                window.setTimeout(function () {
                    synki.classList.remove(state);
                    synki.style.removeProperty("--synki-look-x");
                    eyes.forEach((eye) => {
                        eye.style.removeProperty("--synki-look-x");
                        eye.style.removeProperty("--synki-look-y");
                    });
                }, 650 + Math.random() * 450);
            }
            scheduleIdleReaction();
        }, 6500 + Math.random() * 6500);
    }

    scheduleIdleReaction();

    function scheduleDragExpression() {
        dragExpressionTimer = window.setTimeout(function () {
            if (!isDragging) return;

            synki.classList.remove("surprised", "playful", "happy");
            const expressions = ["surprised", "playful", "happy"];
            synki.classList.add(expressions[Math.floor(Math.random() * expressions.length)]);
            scheduleDragExpression();
        }, 750 + Math.random() * 700);
    }

    function toggleChat() {
        opened = !opened;
        chat.classList.toggle("open", opened);
        chat.setAttribute("aria-hidden", String(!opened));
        bubble.classList.remove("show");
        if (opened) {
            synki.classList.add("happy", "attentive");
            if (authChecked) {
                showWelcome();
                chatInput.focus();
            }
            document.dispatchEvent(new Event("synki:chat-open"));
        } else {
            synki.classList.remove("happy", "attentive");
            document.dispatchEvent(new Event("synki:chat-close"));
        }
    }

    /* Click Synki */
    synki.addEventListener("click", function () {
        if (suppressClick) {
            suppressClick = false;
            return;
        }
        toggleChat();
    });

    chat.querySelector(".synki-chat-close").addEventListener("click", toggleChat);

    chat.querySelector(".synki-chat-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const question = chatInput.value.trim();
        if (!question) return;
        chatInput.value = "";
        if (!isLoggedIn()) {
            addChatMessage(question, false);
            addChatMessage("Please log in or sign up first, then I'll be happy to chat with you personally. 💚", true, true);
            return;
        }

        const history = Array.from(messages.querySelectorAll('[data-ai-message="true"]')).map(function (row) {
            return {
                role: row.classList.contains("synki-chat-user") ? "user" : "assistant",
                content: row.querySelector("p").textContent
            };
        }).slice(-8);
        addChatMessage(question, false, false, true);
        synki.classList.add("thinking", "attentive");
        try {
            const answer = await askAI(question, history);
            synki.classList.remove("thinking");
            synki.classList.add("happy", "responding");
            addChatMessage(answer, true, false, true);
        } catch (error) {
            synki.classList.remove("thinking");
            addChatMessage("Oops 😅 I couldn't connect right now. Try again in a moment.", true, false, true);
        }
        window.setTimeout(function () {
            synki.classList.remove("responding");
            if (!opened) synki.classList.remove("happy", "attentive");
        }, 1400);
    });

    synki.addEventListener("pointerdown", function (event) {
        if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;

        const rect = synki.getBoundingClientRect();
        dragPointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragStartLeft = rect.left;
        dragStartTop = rect.top;
        dragTransition = synki.style.transition;
        isDragging = false;
        dragBubbleState = saveBubble();
        synki.setPointerCapture(event.pointerId);
    });

    synki.addEventListener("pointermove", function (event) {
        if (event.pointerId !== dragPointerId) return;

        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;

        if (!isDragging && Math.hypot(deltaX, deltaY) >= 7) {
            isDragging = true;
            synki.classList.add("dragging", "surprised");
            bubble.textContent = "Wheee! 🍏";
            bubble.classList.add("show");
            synki.style.transition = "left 100ms ease-out, top 100ms ease-out";
            synki.style.left = `${dragStartLeft}px`;
            synki.style.top = `${dragStartTop}px`;
            synki.style.right = "auto";
            synki.style.bottom = "auto";
            scheduleDragExpression();
        }

        if (isDragging) {
            const rect = synki.getBoundingClientRect();
            const left = Math.max(0, Math.min(window.innerWidth - rect.width, dragStartLeft + deltaX));
            const top = Math.max(0, Math.min(window.innerHeight - rect.height, dragStartTop + deltaY));
            synki.style.left = `${left}px`;
            synki.style.top = `${top}px`;
        }
    });

    function finishPointerInteraction(event) {
        if (event.pointerId !== dragPointerId) return;

        if (isDragging) {
            suppressClick = true;
            window.setTimeout(function () {
                suppressClick = false;
            }, 0);
            window.clearTimeout(dragExpressionTimer);
            synki.classList.remove("dragging", "surprised", "playful");
            synki.classList.add("landed", "happy");
            bubble.textContent = "Nice spot! 🍏";
            bubble.classList.add("show");
            window.setTimeout(function () {
                suppressClick = false;
                synki.classList.remove("landed");
                synki.classList.remove("surprised", "playful");
                if (!opened) synki.classList.remove("happy");
                restoreBubble(dragBubbleState);
                dragBubbleState = null;
            }, 1200);
            if (dragTransition) {
                synki.style.transition = dragTransition;
            } else {
                synki.style.removeProperty("transition");
            }
        }

        dragPointerId = null;
        isDragging = false;
        if (synki.hasPointerCapture(event.pointerId)) {
            synki.releasePointerCapture(event.pointerId);
        }
    }

    synki.addEventListener("pointerup", finishPointerInteraction);
    synki.addEventListener("pointercancel", finishPointerInteraction);

    /* Hover reaction */
    synki.addEventListener("mouseenter", function () {

        if (!opened) {
            bubble.textContent = "Psst... 👀";
            bubble.classList.add("show");
            synki.classList.add("curious");
        }

    });

    synki.addEventListener("pointermove", function (event) {
        if (event.pointerType !== "mouse") return;

        eyes.forEach(function (eye) {
            const rect = eye.getBoundingClientRect();
            const deltaX = event.clientX - (rect.left + rect.width / 2);
            const deltaY = event.clientY - (rect.top + rect.height / 2);
            eye.style.setProperty("--synki-look-x", `${Math.max(-2, Math.min(2, deltaX / 9))}px`);
            eye.style.setProperty("--synki-look-y", `${Math.max(-2, Math.min(2, deltaY / 9))}px`);
        });
    });

    synki.addEventListener("mouseleave", function () {

        if (!isDragging) synki.classList.remove("curious");
        eyes.forEach(function (eye) {
            eye.style.removeProperty("--synki-look-x");
            eye.style.removeProperty("--synki-look-y");
        });

        if (!opened) {
            bubble.classList.remove("show");
        }

    });

    document.addEventListener("synki:chat-open", function () {
        synki.classList.add("attentive");
    });

    document.addEventListener("synki:chat-close", function () {
        if (!opened) synki.classList.remove("attentive");
    });

    document.addEventListener("synki:thinking", function () {
        if (reactionTimer) window.clearTimeout(reactionTimer);
        savedBubble = saveBubble();
        synki.classList.add("thinking", "attentive");
        bubble.textContent = "Hmm... 🤔";
        bubble.classList.add("show");
    });

    document.addEventListener("synki:responded", function () {
        synki.classList.remove("thinking");
        restoreBubble(savedBubble);
        savedBubble = null;
        synki.classList.add("happy", "responding");
        window.setTimeout(function () {
            synki.classList.remove("responding");
            if (!opened) synki.classList.remove("happy", "attentive");
        }, 1400);
    });

    document.addEventListener("synki:positive", function () {
        synki.classList.add("happy", "excited");
        window.setTimeout(function () {
            synki.classList.remove("excited");
            if (!opened) synki.classList.remove("happy");
        }, 900);
    });

    document.addEventListener("synki:unclear", function () {
        if (reactionTimer) window.clearTimeout(reactionTimer);
        savedBubble = saveBubble();
        synki.classList.add("confused");
        bubble.textContent = "Hmm... what do you mean? 👀";
        bubble.classList.add("show");
        reactionTimer = window.setTimeout(function () {
            synki.classList.remove("confused");
            restoreBubble(savedBubble);
            savedBubble = null;
        }, 1800);
    });

})();