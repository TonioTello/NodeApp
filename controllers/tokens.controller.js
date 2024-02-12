const _data = require('../lib/data')
const helpers = require('../lib/helpers')

const tokens = {};

tokens.post = (req, res) => {

    const payload = req.body;

    const phone = typeof (payload.phone) === 'number' && Number.isInteger(payload.phone) && payload.phone.toString().length === 10 ? payload.phone : false;
    const password = typeof (payload.password) == 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false;

    if(phone && password){
        // Lookup the user who matches that phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                // Hash the sent password, and compare it to the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    // Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            return res.status(200).json(tokenObject);

                        } else {
                            return res.status(500).json({'Error' : 'Could not create the new token'});
                        }
                    });
                } else {
                    return res.status(400).json({'Error' : 'Password did not match the specified user\'s stored password'});
                }
            } else {
                return res.status(400).json({'Error' : 'Could not find the specified user.'});
            }
        });
    } else {
        return res.status(400).json({'Error' : 'Missing required field(s).'})
    }

};

// GET method
tokens.get = (req, res) => {
    const queryParameters = req.query;

    // Check that id is valid
    const id = typeof(queryParameters.id) == 'string' && queryParameters.id.trim().length == 20 ? queryParameters.id.trim() : false;

    if(id){
        // Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                return res.status(200).json(tokenData);
            } else {
                return res.status(404).send({});
            }
        });
    } else {
        return res.status(400).json({'Error' : 'Missing required field, or field invalid'})
    }
};

// PUT method
tokens.put = (req, res) => {
    const payload = req.body;

    const id = typeof(payload.id) == 'string' && payload.id.trim().length == 20 ? payload.id.trim() : false;
    const extend = typeof(payload.extend) == 'boolean' && payload.extend == true ? true : false;

    if(id && extend){
        // Lookup the existing token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            return res.status(200).send('Token updated');
                        } else {
                            return res.status(500).json({'Error' : 'Could not update the token\'s expiration.'});
                        }
                    });
                } else {
                    return res.status(400).json({"Error" : "The token has already expired, and cannot be extended."});
                }
            } else {
                return res.status(400).json({'Error' : 'Specified user does not exist.'});
            }
        });
    } else {
       return res.status(400).json({"Error": "Missing required field(s) or field(s) are invalid."});
    }
};

// DELETE method
tokens.delete = (req, res) => {
    const queryParameters = req.query;

    // Check that id is valid
    const id = typeof(queryParameters.id) == 'string' && queryParameters.id.trim().length == 20 ? queryParameters.id.trim() : false;

    if(id){
        // Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // Delete the token
                _data.delete('tokens',id,function(err){
                    if(!err){
                        return res.status(200).send('Token deleted');
                    } else {
                        return res.status(500).json({'Error' : 'Could not delete the specified token'});
                    }
                });
            } else {
                return res.status(400).json({'Error' : 'Could not find the specified token.'});
            }
        });
    } else {
        return res.status(400).json({'Error' : 'Missing required field'})
    }
};



module.exports = tokens;