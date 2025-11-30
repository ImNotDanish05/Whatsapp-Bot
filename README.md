<p align="center">
  <a href="https://www.youtube.com/@ImNotDanish05" target="_blank">
    <img src="logo.png" alt="Logo" width="500" class="img-hover">
  </a>
</p>

# WhatsApp Birthday Bot

This is an automated WhatsApp bot that sends birthday messages to a list of contacts at midnight every day. It includes a simple web dashboard to manage the birthday list and view message logs.

## Features

-   **Automated Birthday Messages**: Sends messages automatically at 00:00.
-   **Web Dashboard**: A simple UI to manage contacts and view logs.
-   **CRUD Functionality**: Add, view, update, and delete birthday entries.
-   **Logging**: Keeps a log of sent messages and their status.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **WhatsApp Integration**: `whatsapp-web.js`
-   **Scheduler**: `node-cron`
-   **Frontend**: EJS with TailwindCSS

## Project Structure

```
/
├── src/
│   ├── bot/
│   │   ├── index.js        # WhatsApp client setup
│   │   └── scheduler.js    # Cron job logic
│   ├── controllers/
│   │   ├── birthdayController.js
│   │   └── logController.js
│   ├── models/
│   │   ├── Birthday.js
│   │   └── Log.js
│   ├── routes/
│   │   ├── birthdays.js
│   │   ├── index.js
│   │   └── logs.js
│   ├── views/
│   │   ├── partials/
│   │   ├── birthdays.ejs
│   │   ├── home.ejs
│   │   └── logs.ejs
│   └── public/
├── .env
├── config.js
├── index.js
└── package.json
```

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB instance (local or cloud)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd whatsapp-birthday-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your MongoDB connection string:
    ```
    MONGODB_URI=mongodb://your-mongodb-uri/whatsapp-bot
    ```

### Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    Or for development with auto-reloading:
    ```bash
    npm run dev
    ```

2.  **Connect WhatsApp:**
    -   On the first run, a QR code will appear in your terminal.
    -   Scan this QR code with your WhatsApp mobile app (Link a device).
    -   Once connected, the bot is ready. A `wwebjs_auth` folder will be created to store your session.

3.  **Access the Dashboard:**
    Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

-   `GET /api/birthdays`: Get all birthdays.
-   `POST /api/birthdays`: Add a new birthday.
-   `PUT /api/birthdays/:id`: Update a birthday.
-   `DELETE /api/birthdays/:id`: Delete a birthday.
-   `GET /api/logs`: Get all message logs.

## Deployment & Hosting (Quick)

### Environment (.env)
```
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot
PORT=3000
SESSION_SECRET=change-this-secret
SUPERADMIN_USERNAME=your_admin
SUPERADMIN_PASSWORD=strong_password
WHATSAPP_CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"  # or /usr/bin/google-chrome
```

### Windows
1) Install Node.js (16–20), MongoDB (local or Atlas), and Google Chrome.  
2) `npm install`  
3) Set `.env` as above.  
4) `npm run dev` (dev with nodemon) or `npm start`.  
5) Open `http://localhost:3000/login`, log in with superadmin, scan QR from `/storage/qr/qr.png` if prompted.

### Linux
1) `sudo apt install -y nodejs npm` and MongoDB (or use Atlas).  
2) Install Chrome/Chromium (`chromium-browser` or `google-chrome-stable`), set `WHATSAPP_CHROME_PATH`.  
3) `npm install`  
4) Permissions if needed:
```
sudo chmod -R 777 src/public/storage/qr
sudo chmod -R 777 src/storage/qr
sudo chmod -R 777 logs
```
5) `npm run dev` (dev) or `npm start`/PM2/systemd for production.  
6) Keep puppeteer flags `--no-sandbox --disable-setuid-sandbox` (already set) if sandbox errors appear.

### Optional systemd sketch
```
[Unit]
Description=WhatsApp Bot
After=network.target

[Service]
WorkingDirectory=/path/to/Whatsapp-Bot
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production MONGODB_URI=... PORT=3000 SESSION_SECRET=... SUPERADMIN_USERNAME=... SUPERADMIN_PASSWORD=... WHATSAPP_CHROME_PATH=/usr/bin/google-chrome
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

## Mandatory Writable Paths
- `src/public/storage/qr/` — QR PNG served to UI.
- `src/storage/qr/` — QR state JSON.
- `.wwebjs_auth/` — WhatsApp LocalAuth session (keep writable/persistent).
- `logs/` (if filesystem logs used).
- `temp/` or `src/storage/json/` if used for transient JSON/PNG.
Why: QR regeneration/state, session persistence, and dynamic storage need write access.

## Known Issues & Fixes
- Puppeteer/Chrome launch: set `WHATSAPP_CHROME_PATH`, install Chrome/Chromium, keep `--no-sandbox --disable-setuid-sandbox`.
- QR refresh loop: nodemon restarts on PNG changes; ignore `src/public/storage/qr/`, `src/storage/qr/`, `.wwebjs_auth/` in `.nodemonignore` or disable nodemon in production.
- Login autofill gray: namespaced CSS + `:-webkit-autofill` overrides + `autocomplete="off"/"new-password"` to keep transparent inputs.
- Background/viewport: ensure body background covers full viewport (applied).
- LocalAuth loss: deleting `.wwebjs_auth` or lacking permissions forces re-scan; keep writable/persistent volume.
- Group IDs: search groups via `/api/groups/search` and save `{name,id}`; normalize `@g.us`.

## Quick Start
```
npm install
npm run dev
# visit http://localhost:3000/login, use SUPERADMIN_* creds, scan QR
```
