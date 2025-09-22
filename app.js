const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const userController = require('./controller/userController');
const transferController = require('./controller/transferController');

const app = express();
app.use(express.json());

// Endpoint de health para checagem no workflow
app.get('/health', (req, res) => res.sendStatus(200));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/users', userController);
app.use('/transfers', transferController);

module.exports = app;

