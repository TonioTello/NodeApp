/*
 * Create and export configuration variables
 *  NODE_ENV=production
 */

// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
    'port' : 3000,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret'

};

// Production environment
environments.production = {
    'port' : 5000,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret'

};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
