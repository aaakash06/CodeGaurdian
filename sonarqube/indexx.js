import fetch from "node-fetch";
import { exec } from "child_process";
import * as fs from "fs";
// const rp = require("request-promise-native");
// const { exec } = require("child_process");
// const fs = require("fs");
// const path = require("path");

// Configuration
const SONARQUBE_URL = "http://localhost:9000"; // Your SonarQube URL
const SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"; // Your SonarQube token

const CODE_API_URL = "https://your-code-api-url.com/fetch-code"; // API to fetch the code
const REPORT_API_URL = "https://your-report-api-url.com/post-report"; // API to post the report

// Project details
const projectKey = "my_project_key";
const projectName = "My Project";
// const REPO_DIR = path.join(__dirname, 'repo'); // Directory where the repo will be saved
const REPO_DIR = "./../repos";
// Step 1: Fetch code from another API
async function fetchCodeFromAPI() {
  try {
    // const response = await fetch(CODE_API_URL);
    // if (!response.ok)
    //   throw new Error(`Failed to fetch code. Status: ${response.status}`);

    // const codeData = await response.jsonA();
    // const repoUrl = codeData.repoUrl;
    const repoUrl = "https://github.com/aaakash06/CV-AK";
    // Clone or download the repository code
    console.log("Fetching the repository code...");
    //----------------------- this messes our repo ------------------//
    exec(`git clone ${repoUrl} ${REPO_DIR}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error cloning repository: ${stderr}`);
        return;
      }
      console.log(`Repository cloned: ${stdout}`);
      // createSonarQubeProject();
    });
  } catch (error) {
    console.error("Error fetching code:", error.message);
  }
}

// Step 2: Create a new project in SonarQube
async function createSonarQubeProject() {
  const options = {
    method: "POST",
    uri: `${SONARQUBE_URL}/api/projects/create`,
    qs: {
      project: projectKey,
      name: projectName,
    },
    headers: {
      Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString(
        "base64"
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  try {
    const response = await rp(options);
    console.log(`Project created successfully: ${response.project.name}`);
    analyzeCodeWithSonarQube();
  } catch (error) {
    console.error("Error creating project:", error.message);
  }
}

// Step 3: Analyze the code with SonarQube
function analyzeCodeWithSonarQube() {
  const sonarProjectFile = `
    sonar.projectKey=${projectKey}
    sonar.projectName=${projectName}
    sonar.sources=.
    sonar.host.url=${SONARQUBE_URL}
    sonar.login=${SONARQUBE_TOKEN}
  `;

  fs.writeFileSync(
    path.join(REPO_DIR, "sonar-project.properties"),
    sonarProjectFile
  );

  exec(`cd ${REPO_DIR} && sonar-scanner`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error running SonarQube scanner: ${stderr}`);
      return;
    }
    console.log(`SonarQube analysis complete: ${stdout}`);
    postSonarQubeReport();
  });
}

// Step 4: Post the SonarQube analysis report back to the API
async function postSonarQubeReport() {
  try {
    const reportUrl = `${SONARQUBE_URL}/api/measures/component?component=${projectKey}&metricKeys=code_smells,bugs,vulnerabilities`;

    const response = await fetch(reportUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString(
          "base64"
        )}`,
      },
    });

    if (!response.ok)
      throw new Error(
        `Failed to fetch SonarQube report. Status: ${response.status}`
      );

    const reportData = await response.json();

    // Post the report back to the API
    const postResponse = await fetch(REPORT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!postResponse.ok)
      throw new Error(`Failed to post report. Status: ${postResponse.status}`);

    console.log("SonarQube report posted successfully");
  } catch (error) {
    console.error("Error posting report:", error.message);
  }
}

// Execute the workflow
fetchCodeFromAPI();
