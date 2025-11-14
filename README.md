<style>
.img-hover:hover {
  transform: scale(1.1) rotate(2deg);
  transition: 0.3s ease-in-out;
}
.img-hover {
  transition: 0.3s ease-in-out;
}
</style>

<p align="center">
  <a href="https://www.youtube.com/@ImNotDanish05" target="_blank">
    <img src="logo.png" alt="Logo" width="250" class="img-hover">
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
