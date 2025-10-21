# UPGRADE-WEB-PROJECT

A responsive, full-stack web application designed for managing course content, user registration, and image galleries. This project serves as a foundational template for building a modern web presence with clear separation of client-side assets and server logic.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)


### Features
- User Management: Functionality for user registration and administrative login via dedicated forms.
- Dynamic Content: Separate HTML pages for courses, FAQs, and a team page.
- Image Gallery: Dedicated gallery page with potential for lightbox or modal viewing (as indicated by gallery.css).
- Structured Assets: Cleanly organized client-side code for easy maintenance and scalability.
- Database Integration: Uses MySQL for persistence (via database.sql and .env configuration)

#### Getting Started
#### Prerequisites
You will need the following software installed on your machine:
* [Node.js](https://nodejs.org/) (which includes npm)
* [MySQL](https://www.mysql.com/) or similar database management system.

#### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your GitHub Repository URL]
    cd UPGRADE-WEB-PROJECT
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Database Setup:**
    * Create a MySQL database named **`upgrade2025_db`**.
    * Import the initial schema from the `database.sql` file.
    * Configure your connection details in the **`.env`** file.

##### Usage

To start the server, run the following command to execute the main JavaScript file:

```bash
node upserver.js
The application will be accessible at http://localhost:[DB_PORT] (The port number is defined in your .env file).

###### Project Structure
This project follows the separation of concerns principle to ensure clarity and scalability:UPGRADE-WEB-PROJECT/
├── node_modules/         (npm dependencies)
├── public/               (Client-side assets)
│   ├── css/              (All .css files)
│   ├── images/           (Static images)
│   ├── js/               (All .js files)
│   ├── uploads/          (User uploads)
│   └── *.html            (Main HTML pages)
├── .env                  (Environment config)
├── database.sql          (Database schema)
├── package.json
└── upserver.js           (Server entry point)


The project is organized using a clean separation of concerns:

| Folder | Description |
| :--- | :--- |
| **`public/`** | Contains all static, client-side code accessible by the browser. |
| **`public/css/`** | All style sheets (e.g., `gallery.css`). |
| **`public/js/`** | All client-side JavaScript (e.g., `script.js`). |
| **`public/images/`** | Static image assets. |
| **`public/uploads/`** | User-uploaded files. |
| **`.env`** | Environment configuration for database connection. |
| **`upserver.js`** | The main application server file (Node/Express). |


####### Contributions
This project is  our personal learning tool, but feel free to fork the repository and explore! Any suggestions for improving file management, backend structure, or security practices are welcome.