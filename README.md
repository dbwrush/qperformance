# qperformance

**qperformance** is an app to quickly calculate the performance of Bible Quizzers on all question types across multiple rounds. It processes `.csv` logs generated by QuizMachine along with corresponding `.rtf` question sets, providing a detailed performance analysis of individual quizzers.

## Features

- A simple user interface
- Analyzes quizzer performance for each question type.
- Tracks how often each quizzer:
  - Attempts each type of question.
  - Answers each type correctly.
  - Attempts and answers bonus questions.
- Outputs results in CSV format, which can be easily imported into spreadsheet software like Excel.

---

## Getting Started

### Downloading Compiled Builds

Pre-compiled builds of **qperformance** are available for:

- **Windows PCs** (x86, Intel/AMD CPUs)
- **Linux PCs** (x86, Intel/AMD CPUs)

You can download the latest version from the [Releases](https://github.com/dbwrush/qperformance/releases) section of this repository.

> **Note:**  
> The vast majority of Windows PCs use Intel or AMD CPUs compatible with this program. If you're unsure, try running the Windows build first.

For other systems (e.g., macOS or ARM-based devices), you will need to build the program from source. 

**Command-line**: This version uses a graphical interface that is easier for most users. If you prefer a command-line interface, check out [qperf_cli](https://github.com/dbwrush/qperf_cli)


## Building From Source

If the pre-compiled versions don't work on your machine, or you're using a platform like macOS or ARM-based devices, you can build `qperformance` from source.

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) must be installed on your system.

### Build Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dbwrush/qperformance.git
   cd qperformance
   ```

2. **Build the project**:
   ```bash
   cargo build --release
   ```

3. **Run the executable** from the `target/release` directory:
   ```bash
   ./target/release/qperformance
   ```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.
