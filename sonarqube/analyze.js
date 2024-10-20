import axios from "axios";

// Function to fetch and print the analysis report
export async function fetchAnalysisReport(
  projectKey = "CV-AK",
  SONARQUBE_URL = "http://localhost:9000",
  SONARQUBE_TOKEN = "sqa_8eee13cae5260d01350ef723eb2322db88c6ca6a"
) {
  // const projectKey = sonarQubeConfig.options["sonar.projectKey"];

  try {
    // Fetch issues from SonarQube
    const response = await axios.get(`${SONARQUBE_URL}/api/issues/search`, {
      params: {
        componentKeys: projectKey,
        resolved: false, // Only unresolved issues
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString(
          "base64"
        )}`,
      },
    });

    const issues = response.data.issues;

    if (issues.length === 0) {
      console.log("No issues found.");
      return { issues, summary: "no issues found" };
    }

    let summary = ``;
    console.log(`Found ${issues.length} issue(s):`);
    summary += `Found ${issues.length} issue(s):`;
    issues.forEach((issue) => {
      console.log(
        `- ${issue.message} (Severity: ${issue.severity}, Type: ${issue.type})`
      );
      summary += `- ${issue.message} (Severity: ${issue.severity}, Type: ${issue.type})`;
    });
    return { issues };
  } catch (error) {
    console.error(
      "Error fetching analysis report:",
      error.response ? error.response.data : error.message
    );
  }
}
