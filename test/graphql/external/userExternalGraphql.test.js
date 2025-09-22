// Bibliotecas
const request = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);
require('dotenv').config();

// Testes externos para Users e registerUser via HTTP

describe('Testes externos GraphQL - RegisterUser e Users', () => {
    it('1-Deve registrar um novo usuário com sucesso', async () => {
        const userData = {
            query: `
            mutation RegisterUser($username: String!, $password: String!, $favorecidos: [String!]) {
              registerUser(username: $username, password: $password, favorecidos: $favorecidos) {
                username
                favorecidos
                saldo
              }
            }
          `,
            variables: {
                username: `external_${Date.now()}`,
                password: 'test123',
                favorecidos: ['fav1', 'fav2']
            }
        };
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(userData);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.data).to.exist;
        expect(resposta.body.data.registerUser).to.exist;
        expect(resposta.body.data.registerUser.username).to.equal(userData.variables.username);
        expect(resposta.body.data.registerUser.favorecidos).to.deep.equal(userData.variables.favorecidos);
        expect(resposta.body.data.registerUser.saldo).to.equal(10000);
    });

    it('2-Deve falhar ao tentar registrar um usuário com username já existente', async () => {
        const userData = {
            query: `
            mutation RegisterUser($username: String!, $password: String!, $favorecidos: [String!]) {
              registerUser(username: $username, password: $password, favorecidos: $favorecidos) {
                username
              }
            }
          `,
            variables: {
                username: 'julio', // já existe
                password: 'test123',
                favorecidos: ['fav1']
            }
        };
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(userData);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors).to.exist;
        expect(resposta.body.errors[0].message).to.include('Usuário já existe');
    });

    it('3-Deve retornar erro se campos obrigatórios não forem enviados', async () => {
        const userData = {
            query: `
            mutation RegisterUser($username: String!) {
              registerUser(username: $username) {username
                username
              }
            }
          `,
            variables: {
                username: 'external_fail'
            }
        };
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(userData);
        expect([200, 400]).to.include(resposta.status);
        expect(resposta.body.errors).to.exist;
        expect(resposta.body.errors[0].message).to.include('password');
    });

    it('4-Deve retornar uma lista de usuários_Users', async () => {
        const query = {
            query: `
            query {
              users {
                username
                favorecidos
                saldo
              }
            }
          `
        };
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(query);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.data).to.exist;
        expect(resposta.body.data.users).to.be.an('array');
        expect(resposta.body.data.users.length).to.be.greaterThan(0);

    });
});
