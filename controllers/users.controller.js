const _data = require('../lib/data')
const helpers = require('../lib/helpers')
const tokens = require('./tokens.controller')

users = {};

users.post = (req, res) => {

    const payload = req.body;

    // Check if any of the required params is missing or undefined
    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.password || !payload.tosAgreement) {
        return res.status(400).json({error: 'Missing required parameters'});
    }

    // Check the typeof of all the required params
    const firstName = typeof (payload.firstName) == 'string' && payload.firstName.trim().length > 0 ? payload.firstName.trim() : false;
    const lastName = typeof (payload.lastName) == 'string' && payload.lastName.trim().length > 0 ? payload.lastName.trim() : false;
    const phone = typeof (payload.phone) === 'number' && Number.isInteger(payload.phone) && payload.phone.toString().length === 10 ? payload.phone : false;
    const password = typeof (payload.password) == 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false;
    const tosAgreement = typeof (payload.tosAgreement) == 'boolean' && payload.tosAgreement == true ? true : false;


    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure the user doesn't already exist
        _data.read('users', phone, function (err, data) {
            if (err) {
                // Hash the password
                let hashedPassword = helpers.hash(password);

                // Create the user object
                if (hashedPassword) {
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            return res.status(200).send('User created');
                        } else {
                            console.log(err);
                            return res.status(500).json({'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    return res.status(500).json({'Error': 'Could not hash the user\'s password.'});
                }

            } else {
                // User already exists
                return res.status(400).json({'Error': 'A user with that phone number already exists'});
            }
        });

    } else {
        return res.status(400).json({'Error': 'Missing required fields'});
    }
};

users.get = (req, res) => {
    const queryParameters = req.query;
    const headers = req.headers;


    // Check that phone number is valid
    const phone = typeof (queryParameters.phone) == 'string' && queryParameters.phone.trim().length == 10 ? queryParameters.phone.trim() : false;
    //const phone = typeof(queryParameters.phone) === 'number' && Number.isInteger(queryParameters.phone) && queryParameters.phone.toString().length === 10 ? queryParameters.phone : false;

    if (phone) {

        // Get token from headers
        const token = typeof (headers.token) == 'string' ? headers.token : false;

        tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function (err, data) {
                    if (!err && data) {
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.hashedPassword;
                        return res.status(200).json(data);
                    } else {
                        return res.status(404).send({});
                    }
                });

            } else {
                return res.status(403).json({"Error": "Missing required token in header, or token is invalid."})
            }
        });
    } else {
        return res.status(400).json({'Error': 'Missing required field'})
    }
};

users.put = (req, res) => {
    const payload = req.body;
    const headers = req.headers;

    // Check for required field
    const phone = typeof (payload.phone) === 'number' && Number.isInteger(payload.phone) && payload.phone.toString().length === 10 ? payload.phone : false;

    // Check the typeof of all the options params
    const firstName = typeof (payload.firstName) == 'string' && payload.firstName.trim().length > 0 ? payload.firstName.trim() : false;
    const lastName = typeof (payload.lastName) == 'string' && payload.lastName.trim().length > 0 ? payload.lastName.trim() : false;
    const password = typeof (payload.password) == 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false;

    // Error if phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {

            // Get token from headers
            const token = typeof (headers.token) == 'string' ? headers.token : false;

            tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, function (err, userData) {
                        if (!err && userData) {
                            // Update the fields if necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }
                            // Store the new updates
                            _data.update('users', phone, userData, function (err) {
                                if (!err) {
                                    return res.status(200).send('User updated');
                                } else {
                                    console.log(err);
                                    callback(500, {'Error': 'Could not update the user.'});
                                    return res.status(500).json({'Error': 'Could not update the user.'});
                                }
                            });
                        } else {
                            return res.status(400).json({'Error': 'Specified user does not exist.'});
                        }
                    });

                } else {
                    return res.status(403).json({"Error": "Missing required token in header, or token is invalid."})
                }
            });

        } else {
            return res.status(400).json({'Error': 'Missing fields to update.'});
        }
    } else {
        return res.status(400).json({'Error': 'Missing required field.'});
    }
};

users.delete = (req, res) => {
    const queryParameters = req.query;
    const headers = req.headers;

    // Check that phone number is valid
    const phone = typeof (queryParameters.phone) == 'string' && queryParameters.phone.trim().length == 10 ? queryParameters.phone.trim() : false;

    if (phone) {

        // Get token from headers
        const token = typeof (headers.token) == 'string' ? headers.token : false;

        tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function (err, data) {
                    if (!err && data) {
                        _data.delete('users', phone, function (err) {
                            if (!err) {
                                return res.status(200).send('User deleted');
                            } else {
                                return res.status(500).json({'Error': 'Could not delete the specified user'});
                            }
                        });
                    } else {
                        return res.status(400).json({'Error': 'Could not find the specified user.'});
                    }
                });

            } else {
                return res.status(403).json({"Error": "Missing required token in header, or token is invalid."})
            }

        });
    } else {
        return res.status(400).json({'Error': 'Missing required field'})
    }
};


// Verify if a given token id is currently valid for a given user
tokens.verifyToken = function (id, phone, callback) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};


module.exports = users;