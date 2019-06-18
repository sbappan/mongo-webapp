var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});
const bcrypt = require('bcryptjs');
let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://sanappan:AnDroB0m8.mlb@ds151927.mlab.com:51927/web322_a6_2018");
        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password === userData.password2) {

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    userData.password = hash;
                    
                    let newUser = new User(userData);
                    newUser.save((err) => {
                        if (err) {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: ", err);
                            }
                        }
                        else
                        {
                            resolve();
                        }
                    });
                    console.log("newUser created", userData.userName);
                    console.log("newUser created", userData.password);
                });
            });
        } else {
            reject("Passwords do not match");
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        console.log("searching user", userData.userName);
        User.find({
                userName: userData.userName
            })
            .exec()
            .then((users) => {
                console.log("found user", userData.userName, users.length);
                if (users.length == 0) {
                    reject("Unable to find user: " + userData.userName);
                }
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    console.log("bcrypt.compare res", res);
                    console.log("bcrypt.compare pswd", userData.password, users[0].password);
                    if (res) {
                        users[0].loginHistory.push({
                            dateTime: (new Date()).toString(),
                            userAgent: userData.userAgent
                        });
                        User.update({
                                userName: users[0].userName
                            }, {
                                $set: {
                                    loginHistory: users[0].loginHistory
                                },
                                function (err) {
                                    if (err) {
                                        console.log("There was an error verifying the user: ", err);
                                        reject("There was an error verifying the user: ", err);
                                    }
                                }
                            }, {
                                multi: false
                            })
                            .exec();
                        resolve(users[0]);
                    } else {
                        console.log("Incorrect Password for user: ", userData.userName);
                        reject("Incorrect Password for user: ", userData.userName);
                    }
                });
            })
            .catch(() => {
                reject("Unable to find user: ", userData.userName);
            });
    });
};