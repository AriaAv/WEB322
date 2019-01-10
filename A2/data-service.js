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