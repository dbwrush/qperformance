import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

let questionsPath: string[] = [];
let logsPath: string[] = [];
let outputData: string = ""; // Store the output data for saving

function updateSelectedFiles() {
  document.getElementById("selected-questions")!.textContent = `Selected: ${questionsPath.join(", ") || "None"}`;
  document.getElementById("selected-logs")!.textContent = `Selected: ${logsPath.join(", ") || "None"}`;
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
  const delimiter = (document.getElementById("delimiter") as HTMLInputElement).value;
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

  try {
    const result = await invoke("run_qperf", { input });
    const { status_message, warns, ready_save, output } = result as any;

    document.getElementById("status-message")!.textContent = `Status: ${status_message}`;
    const warningsEl = document.getElementById("warnings")!;
    warningsEl.innerHTML = warns.map((warn: string) => `<p>${warn}</p>`).join("");
    (document.getElementById("save-output") as HTMLButtonElement).disabled = ready_save !== "Ready to save";

    // Store the output data for saving
    outputData = output;
  } catch (error) {
    console.error(error);
    document.getElementById("status-message")!.textContent = "Status: Error running qperf.";
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
    document.getElementById("status-message")!.textContent = "Status: Error saving output.";
  }
}

function clearForm() {
  questionsPath = [];
  logsPath = [];
  updateSelectedFiles();

  (document.getElementById("delimiter") as HTMLInputElement).value = ",";
  (document.getElementById("tournament") as HTMLInputElement).value = "";
  (document.getElementById("display-rounds") as HTMLInputElement).checked = false;

  const checkboxes = document.querySelectorAll("#question-types input[type='checkbox']");
  checkboxes.forEach((checkbox) => ((checkbox as HTMLInputElement).checked = true));

  document.getElementById("status-message")!.textContent = "Status: Waiting for input...";
  document.getElementById("warnings")!.innerHTML = "";
  (document.getElementById("save-output") as HTMLButtonElement).disabled = true;

  outputData = ""; // Clear the output data
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("select-questions")?.addEventListener("click", selectQuestions);
  document.getElementById("select-logs")?.addEventListener("click", selectLogs);
  document.getElementById("run")?.addEventListener("click", runQperf);
  document.getElementById("clear")?.addEventListener("click", clearForm);
  document.getElementById("save-output")?.addEventListener("click", saveOutput);
});
