/*********************************************************************************
*  WEB322 – Assignment 3
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Aria Avazkhani Student ID: 134465160 Date: 2018-11-02
*
*  Online (Heroku) URL: https://agile-scrubland-58476.herokuapp.com/
*
********************************************************************************/ 


var express = require("express");
var HTTP_PORT = process.env.PORT || 8080;
var app = express();
var path = require("path");
var dataService = require('./data-service');
///////// A3 //////////
var multer = require("multer");
var bodyParser = require("body-parser");
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      }
});
var upload = multer({ storage: storage });
var fs = require('fs');
//////////////////////
function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(express.static('public')); 
/////////////// A3 ////////////
app.use(bodyParser.urlencoded({ extended: true }));
//////////////////////////////

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get('/managers', (req, res) => {
    dataService.getManagers()
    .then(data => res.json(data))
    .catch(err => res.json({ message: err}))
});

app.get('/departments', (req, res) => {
    dataService.getDepartments()
    .then(data => res.json(data))
    .catch(err => res.json({ message: err}))
});

/////////////// A3 ////////////////

app.get('/employees/add', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addEmployee.html"));
});

app.get('/images/add', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.json(imageFile);
    })
});

app.post("/employees/add", function (req, res) {
    dataService.addEmployee(req.body)
    .then(res.redirect("/employees"))
    .catch(err => res.json({ message: err}));
});

app.get('/employees', (req, res)  => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err}))
    }
    else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err}))
    }
    else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err}))
    }
    else {
    dataService.getAllEmployees()
    .then(data => res.json(data))
    .catch(err => res.json({ message: err}))
    }
});

app.get('/employees/:employeeNum', (req, res) => {
    dataService.getEmployeesByNum(req.params.employeeNum)
    .then(data => res.json(data))
    .catch(err => res.json({ message: err}));
});

//////////////////////////////////////

app.get('*', (req, res) => {
    res.send("Page Not Found - error 404", 404);
});

dataService.initialize()
    .then(() => {app.listen(HTTP_PORT, onHttpStart);})
    .catch(err => res.json({ message: err}));