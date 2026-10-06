(function () {
    const form = document.querySelector(".auth-form");
    const toast = document.querySelector(".auth-toast");
    let toastTimer;

    function showNotice(message) {
        toast.textContent = message;
        toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove("show");
        }, 2600);
    }

    document.querySelectorAll("[data-notice]").forEach(function (button) {
        button.addEventListener("click", function () {
            showNotice(button.dataset.notice);
        });
    });

    function setError(name, message) {
        const input = form.elements[name];
        const error = document.getElementById(`${name}_error`);
        input.classList.toggle("invalid", Boolean(message));
        input.setAttribute("aria-invalid", String(Boolean(message)));
        error.textContent = message;
    }

    form.querySelectorAll("input:not([type=hidden])").forEach(function (input) {
        input.addEventListener("input", function () {
            setError(input.name, "");
        });
    });

    form.addEventListener("submit", function (event) {
        let valid = true;
        const email = form.elements.email;
        const password = form.elements.password;

        if (!email.value.trim()) {
            setError("email", "Please enter your email address.");
            valid = false;
        } else if (!email.validity.valid) {
            setError("email", "Please enter a valid email address.");
            valid = false;
        }

        if (!password.value) {
            setError("password", "Please enter your password.");
            valid = false;
        } else if (form.dataset.mode === "signup" && password.value.length < 8) {
            setError("password", "Password must be at least 8 characters.");
            valid = false;
        }

        if (form.dataset.mode === "signup") {
            const name = form.elements.full_name;
            const confirmation = form.elements.confirm_password;
            if (!name.value.trim()) {
                setError("full_name", "Please enter your name.");
                valid = false;
            }
            if (password.value !== confirmation.value) {
                setError("confirm_password", "Passwords do not match.");
                valid = false;
            }
        }

        if (!valid) {
            event.preventDefault();
            return;
        }

        const button = form.querySelector(".submit-button");
        button.disabled = true;
        button.textContent = form.dataset.mode === "login" ? "Signing in..." : "Creating account...";
    });
})();
