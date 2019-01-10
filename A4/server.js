/*********************************************************************************
*  WEB322 – Assignment 3
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Aria Avazkhani Student ID: 134465160 Date: 2018-11-15
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
/////////// A4 ///////////
var exphbs = require("express-handlebars");
app.engine('.hbs', exphbs({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }           
    } }));
app.set("view engine", ".hbs");
//////////////////////////
function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(express.static('public')); 
/////////////// A3 ////////////
app.use(bodyParser.urlencoded({ extended: true }));
//////////////////////////////
//////////////// A4 //////////
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get('/', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"));
});

app.get('/about', (req, res) => {
    res.render(path.join(__dirname + "/views/about.hbs"));
});

app.get('/employees/add', (req, res) => {
    res.render(path.join(__dirname + "/views/addEmployee.hbs"));
});

app.get('/images/add', (req, res) => {
    res.render(path.join(__dirname + "/views/addImage.hbs"));
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.render("images", { data: imageFile, title: "Images" });
    })
});

app.get('/employees', (req, res) => {
    if(req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }else{
        dataService.getAllEmployees()
            .then((data) => res.render("employees",{employees:data}))
            .catch(() => res.render("employees",{message: "no results"}))
    }
});

app.get('/departments', (req, res) => {
    dataService.getDepartments()
    .then(data => res.render("departments", {departments: data}))
    .catch(err => res.json({ message: err}))
});

app.get('/employee/:employeeNum', (req, res) => {
    dataService.getEmployeesByNum(req.params.employeeNum)
    .then(data => res.render("employee", { employee: data }))
    .catch(err => res.render("employee",{message:"no results"}));
});

app.post("/employee/update", (req, res) => {
    console.log(req.body)
    .then(data => res.redirect("/employees"));
});

/////////////// A3 ////////////////

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", function (req, res) {
    dataService.addEmployee(req.body)
    .then(res.redirect("/employees"))
    .catch(err => res.json({ message: err}));
});



//////////////////////////////////////

app.get('*', (req, res) => {
    res.send("Page Not Found - error 404", 404);
});

dataService.initialize()
    .then(() => {app.listen(HTTP_PORT, onHttpStart);})
    .catch(err => res.json({ message: err}));