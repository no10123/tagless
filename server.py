# yes the code is ai gened, I just needed to secure my github token.
import os
from flask import Flask, jsonify, request
import requests

# This tells Flask: "Serve all files in the current folder statically,
# and automatically look for index.html when someone visits the root URL (/)"
app = Flask(__name__, static_folder=".", static_url_path="")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

@app.route("/api/github", methods=["GET", "POST"])
def proxy_github():
    if not GITHUB_TOKEN:
        return jsonify({"error": "Server missing GITHUB_TOKEN environment variable"}), 500

    github_endpoint = request.args.get("endpoint", "user")
    url = f"https://api.github.com/{github_endpoint}"

    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    response = requests.get(url, headers=headers)
    return jsonify(response.json()), response.status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
