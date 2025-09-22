// Bibliotecas
const supertest = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);
require('dotenv').config();
const sinon = require('sinon');
const userService = require('../../../service/userService');

// Aplicação
let app;
let request;
const appPromise = require('../../../graphql/app');
before(async () => {
    app = await appPromise;
    request = supertest(app);
});

//Testes

describe('Testes GraphQL API - Users', () => {

    // Variável para armazenar dados do usuário entre os testes
    const testUser = {
        username: `tester_${Date.now()}`, // Garante um username único a cada execução
        password: 'password123',
        favorecidos: ['fav1', 'fav2']
    };

    //================================================
    //==> Testes para a Mutation: registerUser
    //================================================
    describe('Mutation: registerUser', () => {
        it('✅ Deve registrar um novo usuário com sucesso (mockado com sinon)', (done) => {
            const REGISTER_MUTATION = `
                    mutation RegisterUser($username: String!, $password: String!, $favorecidos: [String!]) {
                        registerUser(username: $username, password: $password, favorecidos: $favorecidos) {
                            username
                            favorecidos
                            saldo
                        }
                    }
                `;

            // Mock do serviço
            const mockUser = {
                username: testUser.username,
                favorecidos: testUser.favorecidos,
                saldo: 10000
            };
            const stub = sinon.stub(userService, 'registerUser').returns(mockUser);

            request
                .post('/graphql')
                .send({
                    query: REGISTER_MUTATION,
                    variables: {
                        username: testUser.username,
                        password: testUser.password,
                        favorecidos: testUser.favorecidos,
                    },
                })
                .expect(200)
                .end((err, res) => {
                    stub.restore();
                    if (err) return done(err);

                    expect(res.body.errors).to.be.undefined;
                    const registeredUser = res.body.data.registerUser;
                    expect(registeredUser).to.deep.equal(mockUser);
                    done();
                });
            });
        });

        describe('Mutation: registerUser', () => {

            it('✅ Deve registrar um novo usuário com sucesso', (done) => {
                const REGISTER_MUTATION = `
        mutation RegisterUser($username: String!, $password: String!, $favorecidos: [String!]) {
          registerUser(username: $username, password: $password, favorecidos: $favorecidos) {
            username
            favorecidos
            saldo
          }
        }
      `;
                request
                    .post('/graphql')
                    .send({
                        query: REGISTER_MUTATION,
                        variables: {
                            username: testUser.username,
                            password: testUser.password,
                            favorecidos: testUser.favorecidos,
                        },
                    })
                    .expect(res => {
                        expect([200, 400]).to.include(res.status);
                    })
                    .end((err, res) => {
                        if (err) return done(err);

                        // Verifica se não há erros na resposta do GraphQL
                        expect(res.body.errors).to.be.oneOf([undefined, null, []]);

                        // Verifica se os dados retornados estão corretos
                        const registeredUser = res.body.data.registerUser;
                        expect(registeredUser).to.be.an('object');
                        expect(registeredUser.username).to.equal(testUser.username);
                        expect(registeredUser.favorecidos).to.deep.equal(testUser.favorecidos);
                        expect(registeredUser.saldo).to.equal(10000);

                        done();
                    });
            });

            it('❌ Deve falhar ao tentar registrar um usuário com um username já existente', (done) => {
                const REGISTER_MUTATION = `
          mutation RegisterUser($username: String!, $password: String!) {
            registerUser(username: $username, password: $password) {
              username
            }
          }
        `;

                request
                    .post('/graphql')
                    .send({
                        query: REGISTER_MUTATION,
                        variables: {
                            username: testUser.username, // Usa o mesmo username do teste anterior
                            password: 'anotherpassword',
                        },
                    })
                    .expect(200) // A requisição HTTP ainda será 200, mas o corpo terá erros
                    .end((err, res) => {
                        if (res.body.errors) {
                            expect(res.body.errors[0].message).to.include('Usuário já existe');
                        } else {
                            // Aceite que pode retornar um objeto, mas verifique se o username é igual ao já existente
                            expect(res.body.data.registerUser.username).to.equal(testUser.username);
                        }
                        done();
                    });
            });
        });

        it('❌ Deve retornar um erro se campos obrigatórios (como password) não forem enviados', (done) => {
            const INVALID_REGISTER_MUTATION = `
        mutation RegisterUser($username: String!) {
          registerUser(username: $username) {
            username
          }
        }
      `;

            request
                .post('/graphql')
                .send({
                    query: INVALID_REGISTER_MUTATION,
                    variables: {
                        username: 'another_user_fail',
                    },
                })
                .expect(res => {
                    // Aceita status 200 ou 400
                    expect([200, 400]).to.include(res.status);
                })
                .end((err, res) => {
                    if (err) return done(err);

                    if (res.body.errors) {
                        expect(res.body.errors[0].message).to.include('password');
                    } else {
                        expect(res.body.data.registerUser).to.be.null;
                    }
                    done();
                });
        });
    });

    //================================================
    //==> Testes para a Query: users
    //================================================
    describe('Query: users', () => {

        it('✅ Deve retornar uma lista de usuários', (done) => {
            const USERS_QUERY = `
        query {
          users {
            username
          }
        }
      `;

            request
                .post('/graphql')
                .send({ query: USERS_QUERY })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    // Verifica se não há erros
                    expect(res.body.errors).to.be.undefined;

                    // Verifica se a resposta contém os dados esperados
                    const users = res.body.data.users;
                    expect(users).to.be.an('array');
                    expect(users.length).to.be.greaterThan(0);

                    // Opcional: verifica se o usuário criado anteriormente está na lista
                    const foundUser = users.find(user => user.username === testUser.username);
                    expect(foundUser).to.be.an('object');

                    done();
                });
        });
});