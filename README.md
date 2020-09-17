


<h1 align="center">
  <img src="https://raw.githubusercontent.com/EdRamos12/proffy/master/img/logo.png" width="auto" alt="Proffy" />
</h1>

<p align="center">An open source React/Express application made in <a href="https://github.com/fireship-io/223-electron-screen-recorder">Rocketseat's Next Level Week</a></p>


<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/edramos12/Proffy">
  
  <img alt="License" src="https://img.shields.io/github/license/edramos12/Proffy">
  
  <img alt="Size" src="https://img.shields.io/github/languages/code-size/edramos12/proffy">
   
  <img alt="Status" src="https://img.shields.io/badge/repo%20status-WIP-yellow">
</p>

<p align="center">
 <a href="#about">About</a> — 
 <a href="#-technologies">Technologies</a> — 
 <a href="#-features">Features</a> — 
 <a href="#-running-the-project">Running the project</a> —  
 <a href="#-license">License</a> — 
 <a href="#-contribution">Contribution</a>
</p>

# 📖 About

The purpose of the app, is to connect students and teachers with a social media UI, to turn things easy. It's possible to search for specific teachers for subjects you want to learn/study. The development of this project is for studying purposes to learn more about back-end, React and NodeJS

Developed during **[Next Level Week](https://nextlevelweek.com/)**, organized by **[Rocketseat](https://github.com/Rocketseat)** during the days 3 to 14 of August 2020.

**🚧 Project currently not done. 🚧**

## 📸 Screenshots

You can see more at the web readme.

<img src="https://raw.githubusercontent.com/EdRamos12/proffy/master/img/screenshots/screenshot_1.png" width="auto" alt="Screenshots" />
<img src="https://raw.githubusercontent.com/EdRamos12/proffy/master/img/screenshots/screenshot_2.png" width="auto" alt="Screenshots" />

## ⚙️ Technologies

The following material was used to create this project:

- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [KnexJS](http://knexjs.org/)
- [SQLite 3](https://www.npmjs.com/package/sqlite3)
- [ts-node-dev](https://github.com/whitecolor/ts-node-dev)
- [Express](https://expressjs.com/)
- [multer](https://github.com/expressjs/multer)
- [cookie-parser](https://github.com/expressjs/cookie-parse)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [React](https://reactjs.org/)
- [axios](https://github.com/axios/axios)

## ☑️ Features

Check the list for more details about the project.

### 📦 Back-end

- [x] Create classes
- [x] List teachers (pagination system)
- [x] List teachers with query search (+ pagination system)
- [x] Authentication
- [x] E-mail verification (Reset & Confirm email)
- [x] Update profile
- [x] List specific user
- [x] Delete user
- [x] Edit/Delete own classes
- [ ] List classes from specific user 

### 💻 Front-end

- [x] Class creation form
- [x] Search specific teachers
- [x] Implement authentication
	- [x] Login page
	- [x] Register page
	- [x] Reset/Forgot password page
	- [x] Logout buttons
- [x] Profile pages
- [x] Infinite scroll for classes
- [x] Update classes index
- [ ] Show classes from user on their profile
- [ ] Delete/Edit own classes
- [ ] Delete account

## 🚀 Running the project

### ❔ Requirements

In case you want to run this project, you will need:
- [Git](https://git-scm.com/) 
- [Yarn](https://classic.yarnpkg.com/lang/en/)
- [NodeJS](https://nodejs.org/en/) 

### Cloning this repo

```bash
# Clone this repository
$ git clone -b master https://github.com/EdRamos12/proffy

# Go into the repository
$ cd proffy
```

### 📦 Setting up back-end

<blockquote> 
	<h3>💡 Note</h3>
	You'll need to set up settings on the .env file located at "server/.env"
</blockquote>

```bash
# Go to back-end folder
$ cd server

# Install dependencies (You can either use yarn or npm as package manager)
$ yarn # or 'npm i'

# Mouting database
$ yarn run knex:migrate # or 'npm run knex:migrate'

# Running the application
$ yarn start # or 'npm start'
```
API address: [http://localhost:3333/](http://localhost:3333/).

### 💻 Setting up front-end

<blockquote> 
	<h3>💡 Note</h3>
	To run the web application, the back-end is necessary to be active.
</blockquote>

```bash
# Go to back-end folder
$ cd web

# Install dependencies (You can either use yarn or npm as package manager)
$ yarn # or 'npm i'

# Running the application
$ yarn start # or 'npm start'
```
Website address: [http://localhost:3000/](http://localhost:3000/).

## 📜 License

This project is under the MIT license. See the [LICENSE](https://github.com/EdRamos12/proffy/blob/master/LICENSE) for more information.

## 🤝 Contribution

This project is for study purposes, send me an email telling me what you are doing and teach me your knowledge!
All kinds of contributions are very welcome and appreciated!

- ⭐️ Star the project
- 🐛 Find and report issues
- 📥 Submit PRs to help solve issues or add features
