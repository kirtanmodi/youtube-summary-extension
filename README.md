# YouTube Summary Extension

## Overview

The YouTube Summary Extension is a browser extension that allows users to summarize YouTube videos and ask follow-up questions using GPT-4. This extension enhances the YouTube viewing experience by providing quick summaries and enabling users to gain deeper insights into video content.

## Features

- Summarize YouTube videos
- Ask follow-up questions about the video content
- Simple and intuitive user interface
- Secure API key management
- Markdown rendering for summaries and answers

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/youtube-summary-extension.git
   ```

2. Navigate to the project directory:
   ```
   cd youtube-summary-extension
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up the extension in your browser:
   - Open your browser's extension page (e.g., `chrome://extensions` for Chrome)
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Configuration

1. Obtain an API key from OpenAI:
   - Visit [OpenAI's website](https://openai.com/) and sign up for an account
   - Generate an API key in your account settings

2. Set up the API key in the extension:
   - Click on the extension icon in your browser
   - Click the "Options" button
   - Enter your OpenAI API key and click "Save"

## Usage

1. Navigate to a YouTube video page

2. Click on the extension icon to open the popup

3. Click "Summarize Video" to generate a summary of the current video

4. To ask a follow-up question:
   - Type your question in the input field
   - Click "Ask" or press Enter

5. View the summary and answers in the popup window

## Development

To run the backend server locally:

1. Navigate to the project directory
2. Run the following command:
   ```
   npm start
   ```
   This will start the server on `http://localhost:3000`

## Project Structure

- `manifest.json`: Extension configuration
- `popup.html`: Main extension popup interface
- `popup.js`: JavaScript for the popup functionality
- `popup.css`: Styles for the popup
- `background.js`: Background script for handling API calls and storage
- `content.js`: Content script for interacting with YouTube pages
- `options.html`: Options page for API key management
- `options.js`: JavaScript for the options page functionality
- `server.js`: Backend server for processing requests with OpenAI's API

## Technologies Used

- HTML, CSS, JavaScript
- Chrome Extension APIs
- Express.js
- OpenAI API (GPT-4)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Disclaimer

This extension is not affiliated with, endorsed by, or sponsored by YouTube or Google. Use it responsibly and in accordance with YouTube's terms of service.