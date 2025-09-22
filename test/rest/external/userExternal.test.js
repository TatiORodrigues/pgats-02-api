// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker'); // <-- biblioteca faker
require('dotenv').config();

// Testes de integração_via HTTP
describe.only('Cadastro de Usuário via API/HTTP com uso de faker', () => {

    it('T1-Usuario registrado com sucesso via HTTP_uso de faker', async () => {
        const userData = {
            username: faker.internet.username(),  // <-- nome de usuário real
            password: faker.internet.password({ length: 8 }), // <-- senha aleatória
            favorecidos: [faker.person.firstName(), faker.person.firstName()], // <-- nomes próprios
        };

        const resposta = await request(process.env.BASE_URL_REST)
            .post('/users/register')
            .send(userData);

        console.log("📤 Enviado:", userData);
        console.log("📥 Recebido:", resposta.body);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('username', userData.username);
        expect(resposta.body).to.have.property('favorecidos').that.deep.equals(userData.favorecidos);
        expect(resposta.body).to.have.property('saldo').that.is.a('number');
    });

    it('T2-Usuario registrado sem sucesso_senha vazia_uso de faker', async () => {
        const userData = {
            username: faker.internet.username(),
            password: '',
            favorecidos: [faker.person.firstName(), faker.person.firstName()],
        };

        const res = await request(process.env.BASE_URL_REST)
            .post('/users/register')
            .send(userData);

        console.log("📤 Enviado:", userData);
        console.log("📥 Recebido:", res.body);

        expect(res.status).to.equal(400);
        expect(res.body).to.deep.equal({ error: 'Usuário e senha obrigatórios' });
    });
});
