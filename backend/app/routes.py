import hmac
import json
import os
import re
import sqlite3
import urllib.error
import urllib.request

from flask import (
    Blueprint,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash

from .database import connect


main = Blueprint("main", __name__)


def auth_page(mode, errors=None, values=None):
    token = session.setdefault("form_token", os.urandom(32).hex())
    return render_template(
        "auth.html",
        mode=mode,
        errors=errors or {},
        values=values or {},
        form_token=token,
    )


def form_is_valid():
    token = request.form.get("form_token", "")
    saved_token = session.get("form_token", "")
    return bool(saved_token) and hmac.compare_digest(token, saved_token)


def get_user(user_id):
    with connect(current_app.config["DATABASE"]) as connection:
        return connection.execute(
            """
            SELECT id, COALESCE(NULLIF(full_name, ''), username) AS username
            FROM users WHERE id = ?
            """,
            (user_id,),
        ).fetchone()


@main.route("/")
def home():
    return render_template("index.html")


@main.route("/signup", methods=["GET", "POST"])
def signup():
    if session.get("user_id"):
        return redirect(url_for("main.home"))
    if request.method == "GET":
        return auth_page("signup")
    if not form_is_valid():
        return auth_page("signup", {"form": "Please refresh the page and try again."}), 400

    full_name = request.form.get("full_name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")
    errors = {}
    if not full_name:
        errors["full_name"] = "Please enter your name."
    elif len(full_name) > 80:
        errors["full_name"] = "Please use a name under 80 characters."
    if not email:
        errors["email"] = "Please enter your email address."
    elif not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]{2,}", email):
        errors["email"] = "Please enter a valid email address."
    if not password:
        errors["password"] = "Please enter your password."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."
    elif len(password) > 128:
        errors["password"] = "Password must be 128 characters or fewer."
    if password != confirm_password:
        errors["confirm_password"] = "Passwords do not match."
    if errors:
        return auth_page(
            "signup", errors, {"full_name": full_name, "email": email}
        ), 400

    try:
        with connect(current_app.config["DATABASE"]) as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (username, password_hash, full_name, email)
                VALUES (?, ?, ?, ?)
                """,
                (email, generate_password_hash(password), full_name, email),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return auth_page(
            "signup",
            {"email": "This email is already registered. Please sign in."},
            {"full_name": full_name, "email": email},
        ), 409

    session.clear()
    session["user_id"] = user_id
    session.permanent = request.form.get("remember") == "on"
    return redirect(url_for("main.home"))


@main.route("/login", methods=["GET", "POST"])
def login():
    if session.get("user_id"):
        return redirect(url_for("main.home"))
    if request.method == "GET":
        return auth_page("login")
    if not form_is_valid():
        return auth_page("login", {"form": "Please refresh the page and try again."}), 400

    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    errors = {}
    if not email:
        errors["email"] = "Please enter your email address."
    elif not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]{2,}", email):
        errors["email"] = "Please enter a valid email address."
    if not password:
        errors["password"] = "Please enter your password."
    if errors:
        return auth_page("login", errors, {"email": email}), 400

    with connect(current_app.config["DATABASE"]) as connection:
        user = connection.execute(
            "SELECT id, password_hash FROM users WHERE email = ? COLLATE NOCASE",
            (email,),
        ).fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        return auth_page(
            "login",
            {"password": "Email or password is incorrect."},
            {"email": email},
        ), 401

    session.clear()
    session["user_id"] = user["id"]
    session.permanent = request.form.get("remember") == "on"
    return redirect(url_for("main.home"))


@main.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("main.home"))


@main.route("/api/session")
def api_session():
    user = get_user(session["user_id"]) if session.get("user_id") else None
    if not user:
        session.pop("user_id", None)
    return jsonify(authenticated=bool(user), username=user["username"] if user else None)


@main.route("/api/chat", methods=["POST"])
def api_chat():
    user = get_user(session["user_id"]) if session.get("user_id") else None
    if not user:
        session.pop("user_id", None)
        return jsonify(error="Login required."), 401

    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    history = data.get("history", [])
    if not isinstance(message, str) or not message.strip() or len(message) > 2000:
        return jsonify(error="Enter a message under 2,000 characters."), 400
    if not isinstance(history, list):
        return jsonify(error="Invalid conversation history."), 400

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return jsonify(error="AI chat is not configured."), 503

    messages = [
        {
            "role": "system",
            "content": (
                f"You are Synki, a friendly, playful and supportive BodySynk companion. "
                f"Keep replies concise and natural. The user's name is {user['username']}. "
                "Do not claim access to health data that was not provided."
            ),
        }
    ]
    for item in history[-8:]:
        if (
            isinstance(item, dict)
            and item.get("role") in ("user", "assistant")
            and isinstance(item.get("content"), str)
        ):
            messages.append(
                {"role": item["role"], "content": item["content"][:2000]}
            )
    messages.append({"role": "user", "content": message.strip()})

    payload = json.dumps(
        {"model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"), "messages": messages}
    ).encode("utf-8")
    api_request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(api_request, timeout=30) as response:
            result = json.loads(response.read())
        reply = result["choices"][0]["message"]["content"].strip()
        if not reply:
            raise ValueError("OpenAI returned an empty reply.")
    except urllib.error.HTTPError as error:
        current_app.logger.error("OpenAI chat request failed with status %s", error.code)
        return jsonify(error="AI request failed."), 502
    except (
        urllib.error.URLError,
        TimeoutError,
        json.JSONDecodeError,
        UnicodeDecodeError,
        KeyError,
        IndexError,
        TypeError,
        AttributeError,
        ValueError,
    ):
        current_app.logger.exception("OpenAI chat request could not be completed.")
        return jsonify(error="AI request failed."), 502

    return jsonify(reply=reply)


@main.route("/favicon.ico")
def favicon():
    return redirect(url_for("static", filename="favicon.svg"))


@main.route("/landing")
def landing():
    return render_template("landing.html")
