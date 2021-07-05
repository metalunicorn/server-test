const express = require('express')
const mongoose = require("mongoose");

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/user', require("./routes/user.js"))

require('dotenv').config()


const PORT = process.env.PORT || 5000



const errorHandlers = require('./handlers/errorHadler')
app.use(errorHandlers.notFound)
app.use(errorHandlers.mongoseErrors)

if(process.env.ENV === "DEVELOPMENT"){
    app.use(errorHandlers.developmentErrors)
} else {
    app.use(errorHandlers.productionErrors)
}

async function start() {
    try {
        await mongoose.connect(process.env.mongoUri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, ()=>{
            console.log(`Server listening on port ${PORT}`)
        })
        require('./models/User')
        require('./models/Chatroom')
        require('./models/Message')
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()

module.exports = app