## Databases, Networks and the Web - Web Application

## Mar 2024 - Jul 2024

## Associated with University of London

#### Directory Structure ####

Databases Midterm/
├── middleware/
│   ├── auth.js
│   └── setUser.js
├── node_modules (removed, can be added via installation)
├── public/
│   ├── confirm.js
│   └── main.css
├── routes/
│   ├── auth.js
│   ├── author.js
│   ├── reader.js
│   └── settings.js
├── views/
│   ├── articlePage.ejs
│   ├── authorHome.ejs
│   ├── editArticle.ejs
│   ├── login.ejs
│   ├── mainHome.ejs
│   ├── readerHome.ejs
│   ├── register.ejs
│   └── settingsPage.ejs
├── .env
├── database.db (removed, can be added via creating a new database)
├── db_schema.sql
├── index.js
├── package-lock.json
├── package.json
└──  README.md (This file)

#### Versions used in this template ####

* NodeJS Version: 22.1.0
* npm Version: 10.7.0
* Sqlite3 Version: 3.41.2
Further information can be found in the `package.json` and `package-lock.json` file.

I recommend that you are running Node.js and npm same versions as stated above to avoid any potential or compatibility issues.
Or atleast you should run Node.js version 16.x and npm version 8.x or higher to avoid any compatibility issues.

## Installation

To get started with the Blogging Website, follow the steps below:

**Note:** After unzipping, the folder named `Databases-Networks-and-the-Web-Midterm-University-of-London` becomes a sub-folder. So, you have two options:

   - Run the parent folder and first type `cd Databases-Networks-and-the-Web-Midterm-University-of-London`
   - Or, run just the sub-folder directly

### 1. Install Dependencies

Run the following command to install all necessary dependencies:

```npm install```

### 2. Building the Database

To initialize & create the database, use one of the following commands based on your system:

- For macOS/Linux:

```npm run build-db```

- For Windows:

```npm run build-db-win```

You can also run: 
```npm run clean-db``` to delete the database on Mac or Linux before rebuilding it for a fresh start
```npm run clean-db-win``` to delete the database on Windows before rebuilding it for a fresh start

### 3. Starting the Application

Run ```npm run start``` to start serving the web app (Access via http://localhost:3000)

## Creating an Account

To access the author features, you'll need to create an account. There's some authentication process implemented, you can use dummy email and dummy password to set up an account or you can just connect with google.

## Dependencies

A breakdown of the npm dependencies I have used and their purposes in code:

(1) `bcrypt@5.1.1`: This is a library for hashing and salting passwords. It's used in the code for password security.

(2) `body-parser@1.20.2`: This is a middleware that parses incoming request bodies before my handlers. It's used in the code to parse incoming request bodies.

(3) `compression@1.7.4`: This is a middleware that compresses response bodies for all request that traverse through the middleware. It's used in the code to decrease the size of the response body and hence increase the speed of a web app.

(4) `dotenv@16.4.5`: This module loads environment variables from a `.env` file into `process.env`. It's used in the code to manage environment variables. Variables for password authentication, google client ID and secrets are stored

(5) `ejs@3.1.8`: EJS or Embedded JavaScript Templating is a templating engine used to generate HTML with plain JavaScript. It's used in the code to render views/pages.

(6) `express-session@1.18.0`: This is a middleware for handling session in Express. It's used in the code to manage session data.

(7) `express-validator@7.1.0`: This is a middleware for validating and sanitizing string inputs. It's used in the code to validate and sanitize inputs.

(8) `express@4.18.2`: Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It's used in the code to create my server.

(9) `helmet@7.1.0`: Helmet helps you secure your Express apps by setting various HTTP headers. It's used in the code to enhance security.

(10) `moment-timezone@0.5.45`: This is a library for parsing, validating, manipulating, and displaying dates and times in JavaScript. It's used in the code to handle date and time and to display Pakistan Standard Time (PKT).

(11) `passport-google-oauth20@2.0.0`: and (12) `passport@0.7.0`: Passport is authentication middleware for Node.js. The `passport-google-oauth20` module is a strategy for authenticating with Google using OAuth2.0 API. They're used in the code to handle authentication.

(13) `sqlite3@5.1.2`: This is a library for interfacing with SQLite databases. It's used in the code to interact with my SQLite database.

## Additional Libraries

There are no other libraries utilized beyond what is specified in the `package.json` file.

## Setup For .env file

**Obtaining SESSION_SECRET**

If you has followed previous steps and has Node.js installed, you can run the following command in the terminal:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"

This command generates a random 32-byte string and converts it to hexadecimal format. Store it in .env file.

**Note on Security:**

Do Not Share Your SESSION_SECRET: never share your SESSION_SECRET with anyone. This secret is essential for signing session cookies and ensuring the integrity of your sessions.

Store It Securely: Use environment variables or a secure configuration file (like a .env file) to store your SESSION_SECRET. This helps keep it separate from your source code and protects it from unauthorized access.

Understand Its Importance: Your SESSION_SECRET is vital for preventing session hijacking and ensuring that your users' sessions are secure. Treat it with the same level of care as you would with any sensitive credentials.

Manage Responsibly: If you ever suspect that your SESSION_SECRET has been compromised, make sure to change it immediately.

**Obtaining the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET**

To get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, you need to create a project in the Google Developers Console and set up OAuth 2.0 credentials.

Steps to Obtain GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:

1. Go to Google Developers Console https://console.cloud.google.com/apis/dashboard?project=high-essence-440415-t3
- Log in with your Google account.

2. Create a New Project
- Click on the Create Project button.
- Enter a meaningful Project Name and click Create.

3. Set Up the OAuth Consent Screen
- Go to APIs & Services > OAuth consent screen.
- Select External for user type and fill in the required fields (Application name, Support email, etc.).
- Click Save and Continue through the subsequent steps.

4. Create Credentials
- Navigate to APIs & Services > Credentials.
- Click on Create Credentials > OAuth client ID.
- Choose Web application as the application type.
- Add redirect URI which is 'http://localhost:3000/auth/google/callback'.
- Click Create.

5. Retrieve Client ID and Secret
After creating the credentials, a popup will display your Client ID and Client Secret. Copy these values and store them securely in an already made .env file.

**Note on Security:**

- Keep your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET confidential. Do not share them with anyone or publish them in public repositories (e.g., GitHub, GitLab).

- Do not hardcode these values in your application code. Instead, use environment variables (e.g., .env) or a secure configuration management system to store them.

- Be cautious when using version control systems. Ensure that your .env file or any files containing sensitive information are added to your .gitignore to prevent accidental exposure.

- After you are done running the website, you should remove your GOOGLE_CLIENT_ID and      GOOGLE_CLIENT_SECRET from your environment and consider deleting the project from the Google Developers Console to prevent unauthorized access and to keep your account organized.

- Regularly review your OAuth credentials and revoke any that are no longer in use.

Be sure to follow Google’s OAuth 2.0 documentation for further details and best practices: https://developers.google.com/identity/protocols/oauth2

## Running the App

After the initial setup, you should be able to access the application without further need for compilation or additional installations. If you encounter any issues, ensure that the version requirements for Node.js and npm are met and that all commands are executed in the sub folder that the zip format ends up creating it or just Run the parent folder and first type `cd Databases Midterm`.

You should be able to ONLY run ```npm install```, ```npm run build-db```, and ```npm run start``` 

## User Guide

- **Reader Home page**: No login is required. Readers can view published articles, comment on them but cannot like it, which requires login to like it.

- **Author Home page**: Requires account creation. Authors can write articles, save drafts, publish or delete articles and drafts and manage their blog settings.

## Link to Video

https://youtu.be/u6V39CHcYAQ

Note: Code written between Start and End comments is my own. The rest was provided by the University of London, and other code and resources used has been credited.
