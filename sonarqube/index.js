import fetch from "node-fetch";
import { exec } from "child_process";
import util from "util";
import * as fs from "fs";
import { createSonarQubeProjectt } from "./create.js";
import { fetchAnalysisReport } from "./analyze.js";
import path from "path";
import express from "express";
const execPromise = util.promisify(exec);
const app = express();
app.use(express.json());

app.post("/get-report", async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: "Repository URL is required" });
    }
    const response = await fetchCodeFromAPI(repoUrl);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching report", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Configuration
const SONARQUBE_URL = "http://localhost:9000"; // Your SonarQube URL
const SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"; // Your SonarQube token

const CODE_API_URL = "https://your-code-api-url.com/fetch-code"; // API to fetch the code
const REPORT_API_URL = "https://your-report-api-url.com/post-report"; // API to post the report

let projectKey = "";
let projectName = "";

// const REPO_DIR = path.join(__dirname, 'repo'); // Directory where the repo will be saved
const root_repo_dir = "./../repos";
let REPO_DIR = "";
// Step 1: Fetch code from another API
async function fetchCodeFromAPI(repoUrl) {
  try {
    const parts = repoUrl.split("/");
    projectKey = parts[parts.length - 1];
    projectName = projectKey;
    REPO_DIR = path.join(root_repo_dir, projectKey);
    // Clone or download the repository code
    console.log("Fetching the repository code...");
    //----------------------- this messes our repo ------------------//
    const { err, stdout, stderr } = await execPromise(
      `git clone ${repoUrl} ${REPO_DIR}`
    );

    if (err) {
      console.error(`Error cloning repository: ${stderr}`);
      return;
    }
    console.log(`Repository cloned: ${stdout}`);
    const response = await createSonarQubeProject();
    return response;
  } catch (error) {
    console.error("Error fetching code:", error.message);
  }
}

// Step 2: Create a new project in SonarQube
async function createSonarQubeProject() {
  try {
    await createSonarQubeProjectt();
    const response = await analyzeCodeWithSonarQube();
    return response;
  } catch (error) {
    console.error("Error creating project:", error.message);
  }
}

// Step 3: Analyze the code with SonarQube
async function analyzeCodeWithSonarQube() {
  const sonarProjectFile = `
    sonar.projectKey=${projectKey}
    sonar.projectName=${projectName}
    sonar.sources=${`.`}
    sonar.host.url=${SONARQUBE_URL}
    sonar.login=${SONARQUBE_TOKEN}
    sonar.language=py
  `;

  fs.writeFileSync(
    path.join(REPO_DIR, "sonar-project.properties"),
    sonarProjectFile
  );

  //----------------this require local installation of sonar-scanner and Environment variable-//
  const { err, stdout, stderr } = execPromise(
    `cd ${REPO_DIR} && sonar-scanner`
  );

  if (err) {
    console.error(`Error running SonarQube scanner: ${stderr}`);
    return;
  }
  console.log(`SonarQube analysis complete: ${stdout}`);
  const response = await fetchAnalysisReport();
  return response;
}

app.listen(4000, () => {
  console.log("server has started");
});
