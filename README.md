<!-- <p width="100%">
    <img src="src/assets/images/unicam.png" style="width:30%; float:left">
</p>

<p style="float: left; text-align:left; width:100%; margin-top:30px;">
    <img src="src/assets/logo_grey.png" style="width:65%; float:left">
</p> -->

# PlayWithUnicam

## Introduction
The idea behind the project is to create an teaching tool that offers the possibility of enhancing learning through video games, based on the use of so-called serious games, i.e. games that do not have entertainment as their main purpose, but are designed primarily for educational purposes.

PlayWithUnicam is a web application that aims to provide a portal for the collection of video games in the above-mentioned category, offering the possibility of creating game rooms (lobbies) that allow users to connect with each other to play a particular game together. The focus is on creating an effective, enjoyable and entertaining learning experience.

## Games
The aim is to enrich the platform with educational games, each equipped with a special editor that allows you to modify its behaviour, structure and content, thus making it freely customisable and tailoring the learning experience to the topics you want.

Currently, the games catalogue features the following games:
- **Goose Game:** a customised multiplayer version of the most classic board game.
- **Memory:** a revamped version of the popular children's card game that requires concentration and memory, in which players must match cards.
- **Shared-screen Memory:** a shared-screen version of the previously mentioned game, designed for educational scenarios where only one device is available, allowing multiple players to be controlled by a single user.

## Architecture
PlayWithUnicam has been developed using [Ionic](https://ionicframework.com/) and [Angular](https://angular.io/) frameworks for the front-end while [Node.js](https://nodejs.org/it/) framework was adopted for the back-end along with a [PostgreSQL](https://www.postgresql.org/) relational database.
A [RESTful api]("https://it.wikipedia.org/wiki/Representational_state_transfer") was then set up to allow dialogue between the two parts.

## App usage
#### Initial requirements:
- Install [Node.js](https://nodejs.org/it/download/) and the npm package manager (included with the Node.js installer).
- Install the [PostgreSQL](https://www.postgresql.org/download/) database management system.
- Install the database management tool [PgAdmin](https://www.pgadmin.org/download/).
- Using the latter, create a new database and, to create all the necessary tables, execute the query contained in the file located at the following location:
  - ```./PlayWithUnicam/database/script.sql```

#### Installation:
- Using a terminal window, navigate to the location where you want to clone the app repository by running the following command:
  - ```cd "desired-path"```
- Clone the main repository via the command:
  - ```git clone https://github.com/catervpillar/PlayWithUnicam```
- Navigate to the path ```./PlayWithUnicam/src/app``` via the command:
  -  ```cd /PlayWithUnicam/src/app```
- Clone the games repository via the command:
  -  ```git clone https://github.com/catervpillar/PlayWithUnicam-Games```
- Go back to the path ```/PlayWithUnicam/``` and create a file named ```.env```
- Write the following environment variables into the previously created file:
  - ```SECRET_PWD = **********```
  - ```SECRET_KEY_JWT = **********```
  - ```DB_HOST = **********```
  - ```DB_PORT = **********```
  - ```DB_USER = **********```
  - ```DB_PASSWORD = **********```
  - ```DB_NAME = **********```

  Choosing strings of your choice ```SECRET_PWD``` and ```SECRET_KEY_JWT``` and making sure to put in the entry ```DB_HOST``` the host on which the database is active, in the entry ```DB_PORT``` the port on which it is listening, under ```DB_USER``` the user that owns the database, under ```DB_PASSWORD``` the password of the database and finally under ```DB_NAME``` the name of the database.
- Execute the following command to install all project dependencies:
  -  ```npm install```
- **Optional:** open in write mode the file ```server.js```, located inside the main folder, and in the last line change the port on which the server will listen once started (default: 8081).
- **Only in Unix environment:** make the file ```server.js``` (located in the root directory) executable using the following command:
  -  ```sudo chmod 755 server.js```
- **Only in Unix environment:** if system administrator permissions are needed, prefix the keyword ```sudo``` in each of the above commands.

#### Execution
- Within the root directory, execute the following command to start the server:
  - ```npm start```
- Open your browser and navigate to the address ```http://localhost:portnumber```, replacing ```port-number``` with the port on which the server is running (default: 8081).
