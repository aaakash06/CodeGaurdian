import axios from "axios";

// SonarQube server configuration
// Replace with your SonarQube instance URL and token
const SONARQUBE_URL = "http://localhost:9000"; // Update this to your SonarQube URL
const SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"; // Replace with your SonarQube authentication token

// Project details
const projectKey = "CV-AK1"; // repo name
const projectName = "CV-AK1";
const projectBranch = "main";

// Code analysis details
const projectSource = "path/to/your/project";

async function createSonarQubeProject() {
  try {
    // Create the project
    await axios.post(`${SONARQUBE_URL}/api/projects/create`, null, {
      params: {
        project: projectKey,
        name: projectName,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString(
          "base64"
        )}`,
      },
    });

    console.log("Project created successfully");

    // Run the code analysis
    await axios.post(`${sonarQubeServer}/api/ce/submit`, null, {
      params: {
        project: projectKey,
        branch: projectBranch,
        projectUrl: `https://github.com/your-username/${projectKey}`,
        projectVersion: "1.0",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${sonarQubeToken}:`).toString(
          "base64"
        )}`,
      },
    });

    console.log("Code analysis started");
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

createSonarQubeProject();
