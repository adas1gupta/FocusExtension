# Focus Timer Chrome Extension

A Chrome extension that helps users manage their study sessions and focus in real-time. 

## Features

- Customizable study and break timers
- Audio reminders at adjustable intervals
- Session tracking and analytics

### Prerequisites

- Node.js and npm
- MongoDB (for the analytics server)

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in Chrome to open the timer interface.
2. Set your desired study time, break time, and reminder interval.
3. Click "Start" to begin your study session.
4. The timer will automatically switch between study and break sessions.
5. Use the "Pause" button to temporarily stop the timer, and "Reset" to start over.

## Analytics

The extension tracks various metrics about your study sessions, including:

- Session type (study or break)
- Duration
- Time of day
- Day of the week
- Number of pauses
- Number of reminders played
- Daily study sessions
- Completion rate

This data is anonymized and sent to a server for analysis. You can view your daily stats in the extension interface.

### Setting up the development environment

1. Install dependencies: npm install
2. Set up the MongoDB connection:
- In the root directory of the project, create a file named `.env` if it doesn't already exist.
- Open the `.env` file in a text editor.
- Add the following line to the file:
  ```
  MONGODB_URI=your_actual_mongodb_connection_string_here
  ```
- Replace `your_actual_mongodb_connection_string_here` with your actual MongoDB connection string. It typically looks like this:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
  ```
    Note: The `.env` file contains sensitive information and should never be committed to version control. Make sure it's listed in your `.gitignore` file.
3. Start the development server: npm run start