import requests
import json
import os
from datetime import datetime

USERNAME = "devlopersabbir"
# Fetch more to ensure we find 6 with descriptions
API_URL = f"https://api.github.com/users/{USERNAME}/repos?sort=updated&per_page=30"

def fetch_github_repos():
    print(f"Fetching latest repositories for {USERNAME} with descriptions...")
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        all_repos = response.json()

        if not all_repos:
            print("No repositories found.")
            return

        # Filter for repos with description and limit to 30
        filtered_repos = [r for r in all_repos if r.get("description")][:30]

        if not filtered_repos:
            print("No repositories with descriptions found.")
            return

        projects = []
        for repo in filtered_repos:
            # Fetch languages for each repo
            lang_url = repo.get("languages_url")
            lang_response = requests.get(lang_url)
            languages = []
            if lang_response.status_code == 200:
                languages = list(lang_response.json().keys())

            # Format date (e.g., "Oct 2023")
            updated_at = repo.get("updated_at")
            dt = datetime.strptime(updated_at, "%Y-%m-%dT%H:%M:%SZ")
            formatted_date = dt.strftime("%b %Y")

            projects.append({
                "title": repo.get("name"),
                "description": repo.get("description"),
                "date": formatted_date,
                "tech": languages,
                "link": repo.get("homepage") or repo.get("html_url"),
                "repo_link": repo.get("html_url")
            })

        os.makedirs("src/services/github", exist_ok=True)
        with open("src/services/github/card.json", "w", encoding="utf-8") as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)

        print(f"GitHub JSON updated with {len(projects)} projects.")

    except Exception as e:
        print(f"Error fetching GitHub data: {e}")

if __name__ == "__main__":
    fetch_github_repos()
