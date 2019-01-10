/*********************************************************************************
*  WEB322 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Aria Avazkhani Student ID: 134465160 Date: 2018-10-05
*
*  Online (Heroku) URL: https://agile-scrubland-58476.herokuapp.com/
*
********************************************************************************/ 


var express = require("express");
var HTTP_PORT = process.env.PORT || 8080;
var app = express();
var path = require("path");
var dataService = require('./data-service');

function start() {
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get('/employees', (req, res)  => {
    dataService.getAllEmployees()
    .then(data => res.json(data))
    .catch(err => res.json({ message: err}))
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

app.get('*', (req, res) => {
    res.send("Page Not Found - error 404", 404);
});

dataService.initialize()
    .then(() => app.listen(HTTP_PORT, () => start()))
    .catch(err => res.json({ message: err}));