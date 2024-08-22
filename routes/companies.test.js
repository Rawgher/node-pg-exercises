process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('rvin', 'Rivian', 'Electric car maker') RETURNING  code, name, description`);
    testCompany = result.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe('Get /companies', () => {
    test('Get a list of all companies', async () => {
        const res = await request(app).get(`/companies`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [{code: testCompany.code, name: testCompany.name}] });
    });
});

describe('Get /companies/:code', () => {
    test('Get a single company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany });
    });

    test('Get a 404 if company not found', async () => {
        const res = await request(app).get(`/companies/lcid`);
        expect(res.statusCode).toBe(404);
    });
});

describe('Post /companies', () => {
    test('Post a new company', async () => {
        const res = await request(app).post(`/companies`).send({
            code: 'lcid',
            name: 'Lucid',
            description: 'Premium electric car brand'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'lcid', name: 'Lucid', description: 'Premium electric car brand'}
        });
    });
});

describe('Put /companies/:code', () => {
    test('Update a single company', async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({
            name: 'Rivian Ultra',
            description: 'Really cool electric car brand'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ 
            company: { code: testCompany.code, name: 'Rivian Ultra', description: 'Really cool electric car brand' }
        });
    });

    test('Get a 404 if company not found', async () => {
        const res = await request(app).put(`/companies/lcid`);
        expect(res.statusCode).toBe(404);
    });
});

describe('Delete /companies/:code', () => {
    test('Delete a signle company', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted'})
    })
})