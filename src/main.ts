import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { openUrl } from "@tauri-apps/plugin-opener";

let questionsPath: string[] = [];
let logsPath: string[] = [];
let outputData: string = ""; // Store the output data for saving

function updateButtonStates() {
  const runButton = document.getElementById("run") as HTMLButtonElement;
  const saveOutputButton = document.getElementById("save-output") as HTMLButtonElement;

  // Enable or disable the Run button based on file selection
  if (questionsPath.length === 0 || logsPath.length === 0) {
    runButton.disabled = true;
    runButton.title = "Select files first!";
  } else {
    runButton.disabled = false;
    runButton.title = ""; // Clear the tooltip when enabled
  }

  // Enable or disable the Save Output button based on output readiness
  if (saveOutputButton.disabled) {
    saveOutputButton.title = "Click Run to generate output first!";
  } else {
    saveOutputButton.title = ""; // Clear the tooltip when enabled
  }
}

function updateSelectedFiles() {
  document.getElementById("selected-questions")!.textContent = `Selected: ${questionsPath.join(", ") || "None"}`;
  document.getElementById("selected-logs")!.textContent = `Selected: ${logsPath.join(", ") || "None"}`;

  // Update button states whenever files are selected
  updateButtonStates();
}

function updateStatus(message: string, warnings: string[] = []) {
  const statusMessageEl = document.getElementById("status-message")!;
  const warningsEl = document.getElementById("warnings")!;

  // Update the main status message
  statusMessageEl.textContent = `${message}`;

  // Update warnings if any
  if (warnings.length > 0) {
    warningsEl.innerHTML = warnings.map((warn) => `<p>${warn}</p>`).join("");
  } else {
    warningsEl.innerHTML = ""; // Clear warnings if none
  }
}

async function selectQuestions() {
  const files = await open({ multiple: true, filters: [{ name: "RTF files", extensions: ["rtf"] }] });
  if (files) {
    questionsPath = Array.isArray(files) ? files : [files];
    updateSelectedFiles();
  }
}

async function selectLogs() {
  const files = await open({ multiple: true, filters: [{ name: "CSV files", extensions: ["csv"] }] });
  if (files) {
    logsPath = Array.isArray(files) ? files : [files];
    updateSelectedFiles();
  }
}

async function runQperf() {
  const delimiterInput = (document.getElementById("delimiter") as HTMLInputElement).value;
  const delimiter = delimiterInput.trim() === "" ? "," : delimiterInput; // Default to comma if empty
  const tournament = (document.getElementById("tournament") as HTMLInputElement).value;
  const displayRounds = (document.getElementById("display-rounds") as HTMLInputElement).checked;

  const checkboxes = document.querySelectorAll("#question-types input[type='checkbox']");
  const checked = Array.from(checkboxes).map((checkbox) => (checkbox as HTMLInputElement).checked);

  const input = {
    questions_path: questionsPath,
    logs_path: logsPath,
    delimiter,
    tourn: tournament,
    checked,
    display_individual_rounds: displayRounds,
  };

  // Validate input
  if (questionsPath.length === 0) {
    updateStatus("Please select at least one question set file.", []);
    return;
  }
  if (logsPath.length === 0) {
    updateStatus("Please select at least one QuizMachine record file.", []);
    return;
  }

  try {
    updateStatus("Running QPerformance...");

    const result = await invoke("run_qperf", { input });
    const { status_message, warns, ready_save, output } = result as any;

    updateStatus(status_message, warns);

    // Enable the save button if ready
    const saveOutputButton = document.getElementById("save-output") as HTMLButtonElement;
    saveOutputButton.disabled = ready_save !== "Ready to save";

    // Update button states to reflect changes
    updateButtonStates();

    // Store the output data for saving
    outputData = output;
  } catch (error) {
    console.error(error);
    updateStatus("Error running QPerformance.", []);
  }
}

async function saveOutput() {
  try {
    const filePath = await save({
      filters: [{ name: "CSV file", extensions: ["csv"] }],
    });

    if (filePath) {
      const result = await invoke("save_output", { outputPath: filePath, output: outputData });
      document.getElementById("status-message")!.textContent = result as string;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("status-message")!.textContent = "Error saving output.";
  }
}

function clearForm() {
  questionsPath = [];
  logsPath = [];
  updateSelectedFiles();

  (document.getElementById("delimiter") as HTMLInputElement).value = "";
  (document.getElementById("tournament") as HTMLInputElement).value = "";
  (document.getElementById("display-rounds") as HTMLInputElement).checked = false;

  const checkboxes = document.querySelectorAll("#question-types input[type='checkbox']");
  checkboxes.forEach((checkbox) => ((checkbox as HTMLInputElement).checked = true));

  updateStatus("Waiting for input files");
  (document.getElementById("save-output") as HTMLButtonElement).disabled = true;

  outputData = ""; // Clear the output data
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("select-questions")?.addEventListener("click", selectQuestions);
  document.getElementById("select-logs")?.addEventListener("click", selectLogs);
  document.getElementById("run")?.addEventListener("click", runQperf);
  document.getElementById("clear")?.addEventListener("click", clearForm);
  document.getElementById("save-output")?.addEventListener("click", saveOutput);

  // Add event listeners to the header links
  document.getElementById("quizstuff-link")?.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    openUrl("https://quizstuff.com"); // Open in the default browser
  });

  document.getElementById("github-link")?.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    openUrl("https://github.com/dbwrush/qperformance"); // Open in the default browser
  });

  // Initialize button states on page load
  updateButtonStates();
});
