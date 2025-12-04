const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Movie = require('./../Models/movieModel.js')

dotenv.config({ path: './config.env' })

mongoose.connect(process.env.LOCAL_CONN_STR)
    .then((conn) => {
        console.log("Connection Successful")
    }).catch((error) => {
        console.log(`Error: ${error}`)
    })

const movies = JSON.parse(fs.readFileSync('./data/movies.json','utf-8'))

const deleteMovies = async () =>{
    try{
        await Movie.deleteMany()
        console.log("data successfully deleted");
    }
    catch(err){
        console.log(err.message)
    }
    process.exit()
}

const importMovies = async () =>{
    try{
        await Movie.create(movies)
        console.log("data successfully imported");
    }
    catch(err){
        console.log(err.message)
    }
    process.exit()
}

if(process.argv[2] == "--import"){
    importMovies()
}

if(process.argv[2] == "--delete"){
    deleteMovies()
}