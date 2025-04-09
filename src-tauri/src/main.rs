// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::Path;

#[derive(Serialize, Deserialize)]
struct QperfInput {
    questions_path: Vec<String>,
    logs_path: Vec<String>,
    delimiter: String,
    tourn: String,
    checked: Vec<bool>,
    display_individual_rounds: bool,
}

#[derive(Serialize, Deserialize)]
struct QperfOutput {
    status_message: String,
    warns: Vec<String>,
    output: String,
    ready_save: String,
}

#[tauri::command]
fn run_qperf(input: QperfInput) -> Result<QperfOutput, String> {
    // Validate input paths
    for path in &input.questions_path {
        if !Path::new(path).exists() {
            return Err("Question set location does not exist.".to_string());
        }
    }

    for path in &input.logs_path {
        if !Path::new(path).is_file() {
            return Err("QuizMachine records file does not exist.".to_string());
        }
    }

    // Process question types
    let types: Vec<char> = input
        .checked
        .iter()
        .enumerate()
        .filter_map(|(i, &checked)| {
            if checked {
                Some(['A', 'G', 'I', 'Q', 'R', 'S', 'X', 'V', 'M'][i])
            } else {
                None
            }
        })
        .collect();

    // Call the qperf function (mocked here for simplicity)
    let result = qperf_lib::qperf(
        &input.questions_path.join(","),
        &input.logs_path.join(","),
        false,
        types,
        input.delimiter.clone(),
        input.tourn.clone(),
        input.display_individual_rounds,
    );

    match result {
        Ok((warns, output)) => Ok(QperfOutput {
            status_message: "Success".to_string(),
            warns,
            output,
            ready_save: "Ready to save".to_string(),
        }),
        Err(_) => Err("Error running qperf function".to_string()),
    }
}

#[tauri::command]
fn save_output(output_path: String, output: String) -> Result<String, String> {
    if Path::new(&output_path).exists() {
        return Err("Output file already exists. Choose a different file name.".to_string());
    }

    match fs::File::create(&output_path) {
        Ok(mut file) => {
            if file.write_all(output.as_bytes()).is_ok() {
                Ok("Saved successfully".to_string())
            } else {
                Err("Error writing to output file".to_string())
            }
        }
        Err(_) => Err("Error creating output file".to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![run_qperf, save_output])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
