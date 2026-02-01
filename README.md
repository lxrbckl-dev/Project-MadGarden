# Project MadGarden
> Autonomously develop and display your tech stack network from the tools used in your repositories. Summer 2024.
> 
> **`TypeScript`** **`Docker`** `octokit` `node-cron` `axios` `github-actions` `json`

---

### Local Development
```bash
npm install
npm run build
npm start
```

### Remote Deployment
```bash
docker run \
  -d \
  --name madgarden \
  --restart unless-stopped \
  -e CRON_SCHEDULE="0 0 * * *" \
  -e INPUT_BRANCH=V3 \
  -e INPUT_OWNER=lxrbckl-dev \
  -e INPUT_REPO=Project-SelfStack \
  -e INPUT_PATH="data/automated.json" \
  -e OUTPUT_BRANCH=V2 \
  -e OUTPUT_OWNER=lxrbckl-dev \
  -e OUTPUT_REPO=Project-MadGarden \
  -e OUTPUT_PATH="data/automated.json" \
  -e COMMIT_MESSAGE="Project MadGarden - Automated Data Collection" \
  -e GITHUB_TOKEN=<insert-token> \
  lxrbckl/project-madgarden:v2
```

---