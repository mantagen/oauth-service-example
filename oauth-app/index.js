'use strict';
const env = require('env2')('./config.env');

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 9990
});

server.register([require('vision'), require('inert')], (err) => {

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'views'
    });

    // Authorisation controller

    // expects:
    // qs {client_id, redirect_uri}
    // responds:
    // authorize view with user/password form
    server.route({
        method: 'GET',
        path:'/authorize',
        handler: function (request, reply) {
            const qs = require('querystring');
            const clientCredentials = request.query;
            return reply.view('authorize', clientCredentials);
        }
    });

    // expects:
    // { user, pass, client_id, redirect_uri }
    // responds:
    // redirect -> redirect_uri + auth_code
    server.route({
        method: 'POST',
        path:'/authorize',
        handler: function (request, reply) {
            const userCredentials = request.payload;
            // check user/pass combination
            // check redirect_uri matches db client_id
            // generate code and write to db
            const redirect_uri = userCredentials.redirect_uri;
            const auth_code = "generated auth_code";
            return reply.redirect(redirect_uri + '?code=' + auth_code);
        }
    });

    // Token controller

    // expects:
    // { client_id, client_secret, auth_code }
    // responds:
    // { access_token }
    server.route({
        method: 'POST',
        path:'/access_token',
        handler: function (request, reply) {
            const authCredentials = request.payload;
            const access_token = "generated access_token";
            return reply({access_token: access_token});
        }
    });

});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
