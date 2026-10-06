# My Flask Project

## Setup

From the project root, install the Python dependencies:

```powershell
python -m pip install -r requirements.txt
```

## Run

From the project root, start the Flask app:

```powershell
python backend/run.py
```

Open the local URL printed in the terminal, usually `http://127.0.0.1:5000/`.

## Synki chat

Create an account at `/signup` or log in at `/login`. Account names, email
addresses, and password hashes are stored in `instance/bodysynk.sqlite3`.
Google/Facebook sign-in and password reset are visual placeholders and are not
connected to external services yet.

Set a stable Flask session key and an OpenAI API key in the environment before
starting the app. In PowerShell:

```powershell
$env:SECRET_KEY = "<a-long-random-secret>"
$env:OPENAI_API_KEY = "<your-openai-api-key>"
python backend/run.py
```

`OPENAI_MODEL` may optionally select another chat-completions model; it defaults
to `gpt-4o-mini`. The API key is read only by Flask and is never sent to the
browser.
