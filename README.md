# Skrappy (formerly Wastebin)

A simple disposable code-sharing web app built with Node.js, Express, EJS, and MongoDB.

Users can paste snippets, set an expiration policy (burn after second view, 1h, 24h),
and optionally choose a custom URL. Generated slugs are six-character random strings
that must be unique. The app keeps view counts and deletes burned snippets automatically.

## Features

- Paste and share code quickly
- Optional custom URL or auto-generated slug
- Expiration policies (burn after 2nd view or two days, 1 hour, 24 hours)
- Copy-to-clipboard button on paste pages
- Syntax highlighting using Highlight.js
- Data stored in MongoDB with automatic expiration

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pastebin.git
   cd pastebin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following (example):
   ```env
   DATABASE_URL=mongodb://127.0.0.1:27017/wastebin
   ```
   The repository already ignores `.env` via `.gitignore`, so your real
   credentials won’t be pushed.  You can also copy `env.example` and fill in
   the values.  If you don't provide a file the app will fall back to the
   local `wastebin` database.

4. Start the server:
   ```bash
   node server.js
   ```

5. Open `http://localhost:3000` in your browser.

## Usage

- Visit **/new** to create a new paste.
- Leave "Custom URL" blank for a random slug, or enter an alphanumeric string with
  hyphens/underscores to choose your own.
- After saving, you'll be redirected to the paste; click the **Copy** button to
  copy the contents to your clipboard.
- Burn‑after‑view pastes are removed when viewed twice; if nobody ever clicks
  the link they will be automatically purged after two days.

## Deployment

You can deploy the app to platforms like Heroku, Render, or any server
that supports Node.js. Ensure your `DATABASE_URL` points to a MongoDB
instance and set the appropriate environment variables.

## Security & Privacy

- The application does **not** authenticate users; anyone with a link can view
  or burn a paste.
- Paste content is stored in plain text; treat sensitive code accordingly.
- Secrets such as database URIs or API keys should live in `.env` and that
  file is already ignored by Git (`.gitignore` contains `.env`).

## Contributing

Feel free to fork and submit pull requests. Suggestions and bug reports are
welcome via GitHub issues.

## License

This project is released under the MIT license.