const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const API_URL = "https://your-api-url.com/commits";
const REPO_DIR = path.join(__dirname, "repo");

async function fetchCommits() {
  try {
    const response = await axios.get(API_URL);
    const commits = response.data;

    // Clone or update the repository here based on the commits
    // Assuming the repo is already cloned and you want to fetch the latest changes
    exec(`cd ${REPO_DIR} && git pull`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error updating repository: ${stderr}`);
        return;
      }
      console.log(`Repository updated: ${stdout}`);
      runSonarScanner();
    });
  } catch (error) {
    console.error(`Error fetching commits: ${error.message}`);
  }
}

function runSonarScanner() {
  exec("sonar-scanner", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error running SonarQube scanner: ${stderr}`);
      return;
    }
    console.log(`SonarQube analysis complete: ${stdout}`);
  });
}

fetchCommits();
