// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

describe('GraphQL - Transfer Mutation', () => {
    let token;   

    beforeEach(async () => {
        const respostaLogin = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `
                    mutation LoginUser ($username: String!, $password: String!) {
                        loginUser(username: $username, password: $password) {
                            token
                        }
                    }
                `,
            variables: {
                username: "julio",
                password: "123456"
            }
            })
        
        })

        token = respostaLogin.body.data.loginUser.token;
    })

    