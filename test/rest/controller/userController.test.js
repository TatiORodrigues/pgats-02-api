// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../../app');

// Mock
const userService = require('../../../service/userService');

//Testes unitários mockado e não mockado
describe('Cadastro de Usuário via API/HTTP com uso de faker', () => {

  it('Usuario registrado com sucesso com sinon', async () => {
    const userData = {
      username: 'Usuário 1',
      password: 'teste@1',
      favorecidos: ['favorecido1', 'favorecido2'],
    };

    sinon.stub(userService, 'registerUser').returns(userData);

    const res = await request(app)
      .post('/users/register')
      .send(userData);

    expect(res.status).to.equal(201);
    expect(res.body).to.deep.equal(userData);

    sinon.restore(); // Reseto o Mock
  });

  it('Usuario registrado sem sucesso_senha vazia', async () => {
    const userData = {
      username: 'Usuário 2',
      password: '',
      favorecidos: ['favorecido1', 'favorecido2'],
    };

    const res = await request(app)
      .post('/users/register')
      .send(userData);

    expect(res.status).to.equal(400);
    expect(res.body).to.deep.equal({ error: 'Usuário e senha obrigatórios' });
  });

  it('Deve cadastrar usuário com lista de favorecidos', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ username: 'Usuário 1', password: 'teste@12', favorecidos: ['favorecido1', 'favorecido2'] });

    expect(res.status).to.equal(201);
    expect(res.body).to.deep.include({ 
      username: 'Usuário 1', 
      favorecidos: ['favorecido1', 'favorecido2'], 
    });
  });

  it('Não deve cadastrar sem username', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ password: '123456' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
  });

  it('Não deve cadastrar sem password', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ username: 'joao' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Usuário e senha obrigatórios');
  });
});
