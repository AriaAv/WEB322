const file = require('fs');

var employees = [];
var departments = [];

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        file.readFile('data/employees.json', (err, data) => {
            if (err) reject('unable to read file');
            employees = JSON.parse(data);
            file.readFile('data/departments.json', (err, data) => {
                if (err) reject('unable to read file');
                departments = JSON.parse(data);
                resolve('success');
            });
        });
    });
}

module.exports.getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        if (employees.length == 0) 
            reject('no results returned');
        resolve(employees);
    });
}

module.exports.getManagers = () => {
    return new Promise((resolve, reject) => {
        let managers = employees.filter(employee => employee.isManager == true);
        if (managers == 0) 
            reject('no results returned')
        resolve(managers);
    });
}

module.exports.getDepartments = () => {
    return new Promise((resolve, reject) => {
        if (departments.length == 0) 
            reject('no results returned');
        resolve(departments);
    });
}

/////////// A3 /////////////
module.exports.addEmployee = (employeeData) => {
    if (employeeData.isManager)
        employeeData.isManager = true;
    else
        employeeData.isManager = false;
    var a = employees.length
    employeeData.employeeNum = a + 1;
    employees.push(employeeData);
    return new Promise((resolve, reject) => {
        resolve(employees);
        if (employees.length == 0)
            reject('no results returned');
        
    });
}

module.exports.getEmployeesByStatus = (status) => {
    return new promise ((resolve, reject) => {
        var filter = employees.filter(employees =>
        employees.status == status);
        resolve(filter);
        if (filter.length == 0)
        reject("no result returned");       
    });
}
module.exports.getEmployeesByDepartment = (department) => {
    return new promise ((resolve, reject) => {
        var filter = employees.filter(employees =>
        employees.department == department);
        resolve(filter);
        if (filter.length == 0)
        reject("no result returned");       
    });
}
module.exports.getEmployeesByManager = (manager) => {
    return new promise ((resolve, reject) => {
        var filter = employees.filter(employees =>
        employees.employeeManagerNum == manager);
        resolve(filter);
        if (filter.length == 0)
        reject("no result returned");       
    });
}
module.exports.getEmployeeByNum = (num) => {
    return new promise ((resolve, reject) => {
        var filter = employees.filter(employees =>
        employees.employeeNum  == num);
        resolve(filter);
        if (filter.length == 0)
        reject("no result returned");       
    });
}
////////////////////////////