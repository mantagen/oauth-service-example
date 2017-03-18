'use strict'
const env = require('env2')('./config.env');

const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});
server.connection({ port: 1212 });

server.register(Inert, () => {});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/login',
    handler: function (req, reply) {
      const qs = require('querystring');
      const clientAuthQuery = qs.stringify({
          client_id: process.env.CLIENT_ID,
          redirect_uri: process.env.CLIENT_BASE_URL + '/welcome',
      });
      return reply.redirect(process.env.AUTH_BASE_URL + '/authorize?' + clientAuthQuery);
    }
});

server.route({
    method: 'GET',
    path: '/welcome',
    handler: function (req, reply) {
        const qs = require('querystring');
        const auth_code = qs.parse(req.query).auth_code;
        const axios = require('axios');
        axios
            .post(process.env.AUTH_BASE_URL + '/access_token', {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                auth_code: auth_code,
            })
            .then(function(response){
                const access_token = response.data;
                return reply(access_token);
            })
            .catch(function(error){
                console.error(error);
            });
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
