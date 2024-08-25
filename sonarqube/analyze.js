const scanner = require("sonarqube-scanner");

// Configuration for SonarQube
const sonarQubeConfig = {
  serverUrl: "http://your-sonarqube-server",
  token: "your-sonarqube-token",
  options: {
    "sonar.projectName": "My Project",
    "sonar.projectDescription": "Description of my project",
    "sonar.projectKey": "my_project_key",
    "sonar.sources": "src", // Path to your source code
    "sonar.tests": "test", // Path to your test files
    "sonar.language": "js", // Language of the project
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
async function fetchAnalysisReport() {
  const axios = require("axios");
  const projectKey = sonarQubeConfig.options["sonar.projectKey"];

  try {
    // Fetch issues from SonarQube
    const response = await axios.get(
      `${sonarQubeConfig.serverUrl}/api/issues/search`,
      {
        params: {
          componentKeys: projectKey,
          resolved: false, // Only unresolved issues
        },
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${sonarQubeConfig.token}:`
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
