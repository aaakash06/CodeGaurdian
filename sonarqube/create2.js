import fetch from "node-fetch";

// Replace with your SonarQube instance URL and token
const SONARQUBE_URL = "http://localhost:9000"; // Update this to your SonarQube URL
const SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"; // Replace with your SonarQube authentication token

// Project details
const projectKey = "CV-AK"; // repo name
const projectName = "CV-AK";

async function createSonarQubeProject() {
  const url = `${SONARQUBE_URL}/api/projects/create?project=${projectKey}&name=${projectName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Project created successfully: ${data.project.name}`);
    } else {
      console.error(`Failed to create project. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating project:", error.message);
  }
}

createSonarQubeProject();
