const dotenv = require('dotenv');
const mongoose = require('mongoose')


process.on('uncaughtException',(err)=>{
    console.log(err.name , err.message);
    console.log("Uncaught Exception occured, Shutting down...");
    server.close(()=>{
        process.exit(1);
    })
});

const app = require('./app.js')

dotenv.config({ path: './config.env' })

mongoose.connect(process.env.LOCAL_CONN_STR)
    .then((conn) => {
        console.log("Connection Successful")
    })


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('server has started...');
});

process.on('unhandledRejection',(err)=>{
    console.log(err.name , err.message);
    console.log("Unhandled Exception occured, Shutting down...");
    server.close(()=>{
        process.exit(1);
    })
});

