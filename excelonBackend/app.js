const express = require("express")
const sqlite3 = require("sqlite3")
const {open} = require("sqlite"); 
const cors = require("cors")
const path = require("path")
const bodyParser = require("body-parser")




const app = express()

app.use(cors())

app.use(express.json())

const routingPath = require("./models/cityDetails");




const dbBasePath = path.join(__dirname,"excelonDatabase.db")
console.log(dbBasePath)

let dbObject = null

const initializeServer = async ()=> {
    try {
    dbObject = await  open( {
        filename:dbBasePath,
        driver:sqlite3.Database
    })

   

     await dbObject.exec(` CREATE TABLE IF NOT EXISTS city (
        name TEXT UNIQUE, 
        population INTEGER , 
        country TEXT , 
        latitude REAL , 
        longitude REAL 
    )`); 
     console.log("already created")
     app.locals.dbObject = dbObject;



    app.listen(5001, ()=> (
        console.log("Server is ruuning on 5001")
    ))
}       
catch (error) {
    console.log(`dataBase Error : ${error.message}`)
    process.exit(1)
}
}







initializeServer()


app.use("/cityname", routingPath)



module.exports = app