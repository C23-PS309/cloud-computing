require("dotenv").config()
const express = require("express")
const app = express()
const userRouter = require("./api/users/user.routes")

app.use(express.json())
app.use("/", userRouter);

app.listen(process.env.APP_PORT, () => {
    console.log("Server running on Port: ", process.env.APP_PORT)
})