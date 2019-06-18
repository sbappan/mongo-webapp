/*********************************************************************************
 * WEB322 – Assignment 06
 * 
 * Online (Heroku) Link: https://mongo-webapp322-a6.herokuapp.com/
 *
 ********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require('path');
var clientSessions = require("client-sessions");
var dataServiceAuth = require("./data-service-auth");
var data_service = require("./data-service");
var multer = require("multer");
var fs = require('fs');
var bodyParser = require("body-parser");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(clientSessions({
    cookieName: "session",
    secret: "webapp_a6_web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

var exphbs = require("express-handlebars");
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
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
    }
}));
app.set('view engine', '.hbs');

function serverStartLog() {
    console.log("Express http server listening on " + HTTP_PORT);
}

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get("/", (req, res) => {
    res.render('home', {});
});

app.get("/about", (req, res) => {
    res.render('about', {});
});

app.get("/employees/add", ensureLogin, (req, res) => {
    data_service.getDepartments().then((jsonObj) => {
        res.render("addEmployee", {
            departments: jsonObj
        });
    }).catch((err) => {
        res.render("addEmployee", {
            departments: []
        });
    });
});

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render('addDepartment', {});
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render('addImage', {});
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then((jsonObj) => {
        if (jsonObj) {
            res.render("department", {
                department: jsonObj
            });
        } else {
            res.status(404).send("Department Not Found");
        }
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    data_service.deleteDepartmentById(req.params.departmentId).then((jsonObj) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Department / Department not found)");
    });
});

app.get("/departments", ensureLogin, (req, res) => {
    data_service.getDepartments().then((jsonObj) => {
        if (jsonObj.length > 0) {
            res.render('departments', {
                data: jsonObj
            });
        } else {
            res.render('departments', {
                message: "No results"
            });
        }
    }).catch((err) => {
        res.render('departments', {
            message: "No results"
        });
    });
});

app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((jsonObj) => {
            if (jsonObj.length > 0) {
                res.render('employees', {
                    data: jsonObj
                });
            } else {
                res.render('employees', {
                    message: "No results"
                });
            }
        }).catch((err) => {
            res.render('employees', {
                message: "No results"
            });
        });
    } else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((jsonObj) => {
            if (jsonObj.length > 0) {
                res.render('employees', {
                    data: jsonObj
                });
            } else {
                res.render('employees', {
                    message: "No results"
                });
            }
        }).catch((err) => {
            res.render('employees', {
                message: "No results"
            });
        });
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((jsonObj) => {
            if (jsonObj.length > 0) {
                res.render('employees', {
                    data: jsonObj
                });
            } else {
                res.render('employees', {
                    message: "No results"
                });
            }
        }).catch((err) => {
            res.render('employees', {
                message: "No results"
            });
        });
    } else {
        data_service.getAllEmployees().then((jsonObj) => {
            if (jsonObj.length > 0) {
                res.render('employees', {
                    data: jsonObj
                });
            } else {
                res.render('employees', {
                    message: "No results"
                });
            }
        }).catch((err) => {
            res.render('employees', {
                message: "No results"
            });
        });
    }
});

// setup http server to listen on HTTP_PORT and initialize the data service
data_service.initialize()
    .then(dataServiceAuth.initialize)
    .then(() => app.listen(HTTP_PORT, serverStartLog()))
    .catch((err) => {
        console.log("No data to fetch!");
        console.log("Unable to start server: " + err);
    });

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.writeHead(301, {
        Location: '/images'
    });
    res.end();
});

app.get("/images", ensureLogin, function (req, res) {
    var path2 = "./public/images/uploaded";

    fs.readdir(path2, function (err, items) {
        res.render('images', {
            data: items
        });
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
    data_service.addEmployee(req.body).then((jsonObj) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.json(err)
    });
});

app.post("/employee/update", ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.json(err)
    });
});

app.post("/departments/add", ensureLogin, (req, res) => {
    data_service.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.json(err)
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
    data_service.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.json(err)
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    console.log('req.params.empNum', req.params.empNum);
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
            if (data) {
                viewData.employee = data; //store employee data in the "viewData" object as "employee"
            } else {
                viewData.employee = null; // set employee to null if none were returned
            }
        }).catch(() => {
            viewData.employee = null; // set employee to null if there was an error
        })
        .then(data_service.getDepartments)
        .catch((err) => {
            res.status(500).send("Unable to getDepartments");
        })
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", {
                    viewData: viewData
                }); // render the "employee" view
            }
        })
        .catch((err) => {
            res.status(500).send("Unable to view Employee");
        });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});

app.get("/login", (req, res) => {
    res.render('login', {});
});

app.get("/register", (req, res) => {
    res.render('register', {});
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render('register', {
            successMessage: "User created"
        });
    }).catch((err) => {
        res.render('register', {
            errorMessage: err,
            userName: req.body.userName
        });
    });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body).then((user) => {
            console.log('checkUser /login', user);
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/employees');
        })
        .catch((err) => {
            console.log("err", err);
            res.render('login', {
                "catch": {
                    errorMessage: err,
                    userName: req.body.userName
                }
            });
        })
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", {});
});

app.get("*", function (req, res) {
    res.status(404).send("<h3>Page Not Found</h3>");
});