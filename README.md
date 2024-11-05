# Image Classification API

This project provides an API for classifying images using NSFW.js (Not Safe For Work JavaScript) library. It includes a simple web interface for uploading and testing images.

## Features

- Image classification using NSFW.js
- Support for multiple image uploads (up to 10 images)
- Web interface for easy testing
- Dark mode support

## Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```
   git clone [your-repository-url]
   cd [your-project-directory]
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

The server configuration can be found in the `config.js` file. You can modify the following settings:
## Usage

1. Start the server:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

3. Access the web interface at `http://[HOST]:[PORT]`

4. Use the API endpoint:
   - URL: `http://[HOST]:[PORT]/cls-image`
   - Method: POST
   - Body: Form-data with key 'images' and multiple image files

## API Response

The API returns a JSON object with the following structure:

- `label`: 0 for "Neutral" or "Drawing", 1 for other classifications
- `result`: Array of class probabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.