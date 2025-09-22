// Bibliotecas
const request = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);
require('dotenv').config();

describe('Testes de Transferência', () => {

    before(async () => {
        const loginUser = require('../fixture/requisicoes/login/loginUser.json')
        const respostaLogin = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .send(loginUser);
    
        token = respostaLogin.body.data.loginUser.token;
    });

    beforeEach(() => {
        createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
    }) 

    it('Validar que é possível realizar uma transferência com sucesso', async () => {
        const respostaEsperada = require('../fixture/respostas/transferencia/validarQueEPossivelTransferirGrana.json');
        const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                    mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
                        createTransfer(from: $from, to: $to, value: $value) {
                        date
                        from
                        to
                        value
                        }
                    }
                `,
                variables: {
                    from: 'julio',
                    to: 'priscila',
                    value: 15,
                }
            });

        expect(respostaTransferencia.status).to.equal(200);
        expect(respostaTransferencia.body.data.createTransfer)
            .excluding('date')
            .to.deep.equal(respostaEsperada.data.createTransfer);
    });

    it('Validar que saldo é insuficiente', async () => {

        const respostaSaldoInsuficiente = await request(process.env.BASE_URL_GRAPHQL)
            .post ('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `  
                    mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
                        createTransfer(from: $from, to: $to, value: $value) {
                        date
                        from
                        to
                        value
                        }
                    }       
                `,
                variables: {
                    from: 'julio',
                    to: 'priscila',
                    value: 10000.01,
                }
            });

        expect(respostaSaldoInsuficiente.body.errors[0].message).to.equal('Saldo insuficiente');
        console.log(respostaSaldoInsuficiente.body.errors[0].message);
    });

    const testesDeErrosDeNegocio = require ('../fixture/requisicoes/transferencia/createTransferWithError.json');
    testesDeErrosDeNegocio.forEach(teste => {
        it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
            const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
                .post ('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send(teste.createTransfer);

            expect(respostaTransferencia.status).to.equal(200);
            console.log(respostaSaldoInsuficiente.body.errors[0].message);
        });
    });

});

