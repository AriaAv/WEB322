/*********************************************************************************
*  WEB322 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Aria Avazkhani Student ID: 134465160 Date: 2018-11-30
*
*  Online (Heroku) URL: https://agile-scrubland-58476.herokuapp.com/
*
********************************************************************************/ 


var express = require("express");
var HTTP_PORT = process.env.PORT || 8080;
var app = express();
var path = require("path");
var dataService = require('./data-service');
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
function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true }));
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
    dataService.getDepartments()
    .then((data)=>res.render("addEmployee",{departments:data}))
    .catch(()=>res.render("addEmployee",{departments:[]})) 
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
        .then((data) => {
            if(data.length>0) res.render("employees",{employees:data});
            else res.render("employees",{message: "no results"})
        })
        .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager)
        .then((data) => {
            if(data.length>0) res.render("employees",{employees:data});
            else res.render("employees",{message: "no results"})
        })
        .catch(() => res.render("employees",{message: "no results"}))
    }else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data) => {
            if(data.length>0) res.render("employees",{employees:data});
            else res.render("employees",{message: "no results"})
        })
        .catch(() => res.render("employees",{message: "no results"}))
    }else{
        dataService.getAllEmployees()
        .then((data) => {
            if(data.length>0) res.render("employees",{employees:data});
            else res.render("employees",{message: "no results"})
        })
        .catch(() => res.render("employees",{message: "no results"}))
    }
});

app.get('/departments', (req, res) => {
    dataService.getDepartments()
    .then((data) => {
        if(data.length>0) res.render("departments",{departments:data});
        else res.render("departments",{message: "no results"})
    })
    .catch(() => res.render("departments",{"message": "no results"}))
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, imageFile){
        res.render("images",  { data: imageFile, title: "Images" });
    })

});

app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee[0].department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

app.post("/employee/update", function(req, res){
    dataService.updateEmployee(req.body)
    .then(res.redirect('/employees'))
    .catch((err) => res.json({"message": err}))  
});

app.get('/employees/delete/:empNum', (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then((data) => res.redirect("/employees"))
    .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});

app.post("/employees/add", function (req, res) {
    dataService.addEmployee(req.body)
    .then(res.redirect("/employees"))
    .catch(err => res.json({ message: err}));
});

app.post('/departments/add', function(req, res) {
    dataService.addDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({"message": err}))   
});

app.post("/departments/update", function(req, res){
    dataService.updateDepartment(req.body)
    .then(res.redirect('/departments'))
    .catch((err) => res.json({"message": err}))  
});

app.get('/departments/:departmentId', (req, res) => {
    dataService.getDepartmentById(req.params.departmentId)
    .then((data) => {
        if(data.length>0) res.render("departments",{department:data});
        else res.status(404).send("Department Not Found"); 
    })
    .catch(()=>{res.status(404).send("Department Not Found")})
});

app.get('/departments/delete/:departmentId', (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then((data) => res.redirect("/departments"))
    .catch(() => res.status(500).send("Unable to Remove department / department not found"))
});

app.get('*', (req, res) => {
    res.send("Page Not Found - error 404", 404);
});

dataService.initialize()
    .then(() => {app.listen(HTTP_PORT, onHttpStart);})
    .catch(err => res.json({ message: err})
);


