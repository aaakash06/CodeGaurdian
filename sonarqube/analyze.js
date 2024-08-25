import axios from "axios";
import { scan } from "sonarqube-scanner";
// Configuration for SonarQube
const sonarQubeConfig = {
  serverUrl: "http://localhost:9000",
  token: "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a",
  options: {
    "sonar.projectName": "CV-AK",
    "sonar.projectDescription": "Random Desc",
    "sonar.projectKey": "CV-AK",
    "sonar.sources": ".", // Path to your source code
    "sonar.tests": "", // Path to your test files
    "sonar.language": "python", // Language of the project
  },
};

// Run SonarQube Scanner
scanner(sonarQubeConfig, (error) => {
  if (error) {
    console.error("SonarQube scan failed:", error);
    process.exit(1);
  }
  console.log("SonarQube scan completed successfully.");

  // Fetch the analysis report
  fetchAnalysisReport();
});

// Function to fetch and print the analysis report
export async function fetchAnalysisReport(
  projectKey = "CV-AK",
  SONARQUBE_URL = "http://localhost:9000",
  SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"
) {
  // const projectKey = sonarQubeConfig.options["sonar.projectKey"];

  try {
    // Fetch issues from SonarQube
    const response = await axios.get(
      // `${sonarQubeConfig.serverUrl}/api/issues/search`,
      `${SONARQUBE_URL}/api/issues/search`,
      {
        params: {
          componentKeys: projectKey,
          resolved: false, // Only unresolved issues
        },
        headers: {
          Authorization: `Basic ${Buffer.from(
            // `${sonarQubeConfig.token}:`
            `${SONARQUBE_TOKEN}:`
          ).toString("base64")}`,
        },
      }
    );

    const issues = response.data.issues;

    if (issues.length === 0) {
      console.log("No issues found.");
      return;
    }

    console.log(`Found ${issues.length} issue(s):`);
    issues.forEach((issue) => {
      console.log(
        `- ${issue.message} (Severity: ${issue.severity}, Type: ${issue.type})`
      );
    });
  } catch (error) {
    console.error(
      "Error fetching analysis report:",
      error.response ? error.response.data : error.message
    );
  }
}
