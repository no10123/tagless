# yes the code is ai gened, I just needed to secure my github token.
import os

import requests
from flask import Flask, jsonify, request

app = Flask(__name__, static_folder="public", static_url_path="")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_ISSUES_URL = "https://api.github.com/repos/no10123/tagless/issues"

def github_headers():
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    return headers


def github_response(response):
    try:
        data = response.json()
    except ValueError:
        return jsonify({"error": "GitHub returned invalid JSON"}), 502

    if response.status_code >= 400 and isinstance(data, dict):
        return jsonify({
            "error": data.get("message", "GitHub API error")
        }), response.status_code

    return jsonify(data), response.status_code


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/health")
def health():
    return jsonify({"ok": True})


@app.route("/api/leaderboard", methods=["GET", "POST"])
def leaderboard():
    if request.method == "GET":
        # Public leaderboard: only retrieve issues with the score label.
        try:
            response = requests.get(
                GITHUB_ISSUES_URL,
                params={
                    "labels": "score",
                    "state": "all",
                    "per_page": 100,
                },
                headers=github_headers(),
                timeout=10,
            )
            return github_response(response)

        except requests.RequestException:
            app.logger.exception("Could not retrieve leaderboard")
            return jsonify({"error": "GitHub is temporarily unavailable"}), 502

    # POST: create a score issue, never edit or delete issues.
    if not GITHUB_TOKEN:
        return jsonify({"error": "Server is missing GITHUB_TOKEN"}), 500

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Expected a JSON object"}), 400

    title = data.get("title")
    body = data.get("body", "")

    if (
        not isinstance(title, str)
        or not title.strip()
        or len(title) > 200
        or not isinstance(body, str)
        or len(body) > 5000
    ):
        return jsonify({"error": "Invalid score data"}), 400

    # Always apply the score label on the server.
    payload = {
        "title": title.strip(),
        "body": body,
        "labels": ["score"],
    }

    try:
        response = requests.post(
            GITHUB_ISSUES_URL,
            headers=github_headers(),
            json=payload,
            timeout=10,
        )
        return github_response(response)

    except requests.RequestException:
        app.logger.exception("Could not submit leaderboard score")
        return jsonify({"error": "Could not submit score"}), 502


if __name__ == "__main__":
    # Development server; use Gunicorn on Nest.
    app.run(host="0.0.0.0", port=5000, debug=False)
