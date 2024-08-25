const axios = require("axios");

// SonarQube server configuration
const sonarQubeServer = process.env.SONARQUBE_URL;
const sonarQubeToken = process.env.SONARQUBE_TOKEN;

// Project details
const projectKey = "CV-AK"; // repo name
const projectName = "CV-AK";
const projectBranch = "main";

// Code analysis details
const projectSource = "path/to/your/project";

async function createSonarQubeProject() {
  try {
    // Create the project
    const response = await axios.post(
      `http://localhost:9000/api/projects/create`,
      null,
      {
        params: {
          project: projectKey,
          name: projectName,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${sonarQubeToken}:`).toString(
            "base64"
          )}`,
        },
      }
    );

    if (response.status === 200 && response.data.project) {
      console.log(
        `Project created successfully: ${response.data.project.name}`
      );
    } else {
      console.error("Failed to create project");
    }

    // // Run the code analysis
    // const analysisResponse = await axios.post(
    //   `${sonarQubeServer}/api/ce/submit`,
    //   null,
    //   {
    //     params: {
    //       project: projectKey,
    //       branch: projectBranch,
    //       projectUrl: `https://github.com/aaakash06/${projectKey}`,
    //       projectVersion: "1.0",
    //     },
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //       Authorization: `Basic ${Buffer.from(`${sonarQubeToken}:`).toString(
    //         "base64"
    //       )}`,
    //     },
    //   }
    // );

    // console.log("Code analysis started, waiting for results...");

    // // Poll for analysis completion
    // const taskId = analysisResponse.data.taskId;
    // await waitForAnalysisCompletion(taskId);

    // // Print the analysis report
    // await printAnalysisReport();
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// async function waitForAnalysisCompletion(taskId) {
//   const maxRetries = 20; // Maximum number of retries
//   const interval = 5000; // Interval between retries in milliseconds

//   for (let i = 0; i < maxRetries; i++) {
//     const response = await axios.get(`${sonarQubeServer}/api/ce/task`, {
//       params: {
//         id: taskId,
//       },
//       headers: {
//         Authorization: `Basic ${Buffer.from(`${sonarQubeToken}:`).toString(
//           "base64"
//         )}`,
//       },
//     });

//     const status = response.data.task.status;
//     console.log(`Analysis status: ${status}`);

//     if (status === "FINISHED") {
//       console.log("Analysis completed successfully.");
//       return;
//     } else if (status === "FAILED") {
//       console.error("Analysis failed.");
//       throw new Error("SonarQube analysis failed");
//     }

//     // Wait before polling again
//     await new Promise((resolve) => setTimeout(resolve, interval));
//   }

//   console.error("Analysis did not complete in the expected time.");
//   throw new Error("Timeout waiting for SonarQube analysis completion");
// }

// async function printAnalysisReport() {
//   try {
//     // Fetch the project issues
//     const issuesResponse = await axios.get(
//       `${sonarQubeServer}/api/issues/search`,
//       {
//         params: {
//           componentKeys: projectKey,
//           resolved: false, // Only unresolved issues
//         },
//         headers: {
//           Authorization: `Basic ${Buffer.from(`${sonarQubeToken}:`).toString(
//             "base64"
//           )}`,
//         },
//       }
//     );

//     const issues = issuesResponse.data.issues;

//     if (issues.length === 0) {
//       console.log("No issues found.");
//       return;
//     }

//     console.log(`Found ${issues.length} issue(s):`);
//     issues.forEach((issue) => {
//       console.log(
//         `- ${issue.message} (Severity: ${issue.severity}, Type: ${issue.type})`
//       );
//     });
//   } catch (error) {
//     console.error("Error fetching analysis report:", error.response.data);
//   }
// }

// // Execute the script
createSonarQubeProject();
