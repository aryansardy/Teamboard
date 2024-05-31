import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import pg from "pg";
import bodyparser from "body-parser";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
const workFactor = 8;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)))

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "RTC",
    password: "sardana",
    port: 5432,

})
db.connect();


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "/register.html"))
})

app.post("/register", (req, res, err) => {
    const user = req.body.username;
    var password = req.body.password;

    bcrypt.hash(password, workFactor, async function (err, hash) {
        
        console.log(`Hash: ${hash}`);
        var users = await db.query("Select * from Users where username=$1", [user]);
        users = users.rows;

        if (users.length > 0) {
            console.log("User exists");
            res.sendFile(__dirname + "/Login.html")
        }
        else {

            db.query(`INSERT INTO Users (username, password) VALUES ($1, $2)`, [user, hash], () => {
                console.log("user added");
                res.sendFile(__dirname + "/index.html");

            })

        }





    });

})

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/login.html"));
})

app.post("/login", async (req, res) => {
    const user = req.body.username;
    const password = req.body.password;
    var users = await db.query("Select * from Users where username=$1", [user]);
    users = users.rows;
    console.log(users);
    if (users.length > 0) {
        console.log("User exists");
        var savedPassword = await db.query("Select password from Users where username=$1", [user]);
        savedPassword = savedPassword.rows[0].password;
        bcrypt.compare(password, savedPassword, function (err, result) {
            // Password matched
            if (result) { 
                res.sendFile(__dirname + '/index.html');
            }
            // Password not matched
            else {
                res.send("Incorrect password");
            }
        });


    }
})









app.listen(port, () => {
    console.log(`Server live at port ${port}`);
});