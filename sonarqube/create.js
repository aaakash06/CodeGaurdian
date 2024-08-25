import axios from "axios";

export async function createSonarQubeProjectt(
  SONARQUBE_URL = "http://localhost:9000",
  SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a",
  projectKey = "CV-AK",
  projectName = "CV-AK",
  projectBranch = "main"
) {
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
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}
