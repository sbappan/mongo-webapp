const Sequelize = require("sequelize");
var sequelize = new Sequelize("d4e9i6baeekqr0", "ikohwrxnrhiggm", "c870db61b00d345c912e42e812fbf143691abcb3e6c57d9a07cc9193a502cfb5", {
    host: "ec2-50-17-203-51.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
}, {
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
}, {
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

Department.hasMany(Employee, {
    foreignKey: 'department'
});

module.exports = {
    initialize: function () {
        return new Promise(function (resolve, reject) {
            sequelize.sync().then(function () {
                    resolve();
                })
                .catch(function (error) {
                    console.log("something went wrong sync!");
                    reject({
                        message: 'Unable to sync the database'
                    });
                });
        });
    },
    getAllEmployees: function () {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                order: ['employeeNum']
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getAllEmployees'
                });
            });
        });
    },
    getDepartments: function () {
        return new Promise(function (resolve, reject) {
            Department.findAll({
                order: ['departmentId']
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getDepartments'
                });
            });
        });
    },
    addEmployee: function (employeeData) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var key in employeeData) {
            if (employeeData.hasOwnProperty(key)) {
                if (employeeData[key] == "") {
                    employeeData[key] = null;
                }
            }
        }

        return new Promise(function (resolve, reject) {
            Employee.create({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                hireDate: employeeData.hireDate,
                department: employeeData.department
            }).then(function (employee) {
                console.log("success!")
                resolve();
            }).catch(function (error) {
                console.log("something went wrong create!");
                reject({
                    message: 'Unable to create employee'
                });
            });
        });
    },
    getEmployeesByStatus: function (status) {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                order: ['employeeNum'],
                where: {
                    status: status
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getEmployeesByStatus'
                });
            });
        });
    },
    getEmployeesByDepartment: function (department) {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                order: ['employeeNum'],
                where: {
                    department: department
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getEmployeesByDepartment'
                });
            });
        });
    },
    getEmployeesByManager: function (manager) {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                order: ['employeeNum'],
                where: {
                    employeeManagerNum: manager
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getEmployeesByManager'
                });
            });
        });
    },
    getEmployeeByNum: function (num) {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                where: {
                    employeeNum: num
                }
            }).then(function (data) {
                resolve(data[0].dataValues);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getEmployeeByNum'
                });
            });
        });
    },
    updateEmployee: function (employeeData) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var key in employeeData) {
            if (employeeData.hasOwnProperty(key)) {
                if (employeeData[key] == "") {
                    employeeData[key] = null;
                }
            }
        }

        return new Promise(function (resolve, reject) {
            Employee.update({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                hireDate: employeeData.hireDate,
                department: employeeData.department},
                {
                    where: {
                        employeeNum: employeeData.employeeNum
                    }
            }).then(function (data) {
                resolve(data[0].dataValues);
            }).catch(function (error) {
                reject({
                    message: 'Unable to update employee'
                });
            });
        });
    },
    addDepartment: function (departmentData) {
        for (var key in departmentData) {
            if (departmentData.hasOwnProperty(key)) {
                if (departmentData[key] == "") {
                    departmentData[key] = null;
                }
            }
        }

        return new Promise(function (resolve, reject) {
            Department.create({
                departmentName: departmentData.departmentName
            }).then(function () {
                console.log("success!")
                resolve();
            }).catch(function () {
                console.log("something went wrong create Department!");
                reject({
                    message: 'Unable to create department'
                });
            });
        });
    },
    updateDepartment: function (departmentData) {
        for (var key in departmentData) {
            if (departmentData.hasOwnProperty(key)) {
                if (departmentData[key] == "") {
                    departmentData[key] = null;
                }
            }
        }

        return new Promise(function (resolve, reject) {
            console.log('updateDepartment promise');
            Department.update({
                departmentName: departmentData.departmentName,
            },{where: {
                departmentId: departmentData.departmentId
            }}
            ).then(function (data) {
                resolve(data[0].dataValues);
            }).catch(function (error) {
                reject({
                    message: 'Unable to update department'
                });
            });
        });
    },
    getDepartmentById: function (id) {
        return new Promise(function (resolve, reject) {
            Department.findAll({
                where: {
                    departmentId: id
                }
            }).then(function (data) {
                resolve(data[0].dataValues);
            }).catch(function (error) {
                reject({
                    message: 'Unable to getDepartmentById'
                });
            });
        });
    },
    deleteDepartmentById: function (id) {
        return new Promise(function (resolve, reject) {
            Department.destroy({
                where: {
                    departmentId: id
                }
            }).then(function () {
                resolve();
            }).catch(function (error) {
                reject({
                    message: 'Unable to deleteDepartmentById'
                });
            });
        });
    },
    deleteEmployeeByNum: function (empNum) {
        return new Promise(function (resolve, reject) {
            Employee.destroy({
                where: {
                    employeeNum: empNum
                }
            }).then(function () {
                resolve();
            }).catch(function (error) {
                reject({
                    message: 'Unable to deleteEmployeeByNum'
                });
            });
        });
    }
};