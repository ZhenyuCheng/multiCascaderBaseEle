const _ = require('./utils');

module.exports = {
    output: _.resolve('./dist/'),
    devServerPort: 5000,
    devAssertPublicPath: 'http://127.0.0.1:5000/'
}