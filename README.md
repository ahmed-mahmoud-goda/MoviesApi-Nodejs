# Movie API Project

  This project was made while learning Nodejs. It providing CRUD operations for movies and user authentication.

## Features

  - User registration & login
  - Create, read, update, delete movies
  - JWT-based authentication
  - MongoDB for storage

## Tech Stack

  - Node.js
  - Express
  - MongoDB
  - JWT

## After Cloning

1. Install dependencies:

   npm install

2. Create a `.env` file (if not exist) and add:

   NODE_ENV=development
   PORT= 3000
   LOCAL_CONN_STR= mongodb://localhost:27017/Movies
   SECRET_STR= your_jwt_secret_here
   LOGIN_EXPIRE= 30d

## Running Project

  - Development mode:
  
    npm run start
  
  - Production mode:
  
    npm run start_prod

## Notes

  This script allows you to populate or clear the `movies` collection:

  - To Populate:

    node importMovies.js --import
    
  - To Clear:
    
    node importMovies.js --delete
    
