process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;
beforeEach(async () => {
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('rvin', 'Rivian', 'Electric car maker')`);

    const res = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('rvin', 200, false, null) RETURNING id, comp_Code, amt, paid, paid_date, add_date`);
    testInvoice = res.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe('Get /invoices', () => {
    test('Get a list of all invoices', async () => {
        const res = await request(app).get(`/invoices`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [{id: testInvoice.id, comp_code: testInvoice.comp_code}] })
    });
});


describe('Get /invoices/:id', () => {
    test('Get a single invoice', async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        
        const thisInvoice = {
            id: testInvoice.id,
            amt: testInvoice.amt,
            paid: testInvoice.paid,
            add_date: res.body.invoice.add_date,
            paid_date: testInvoice.paid_date,
            company: {
                code: testInvoice.comp_code,
                name: 'Rivian',
                description: 'Electric car maker'
            }
        };

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: thisInvoice })
    });

    test('Get a 404 if invoice not found', async () => {
        const res = await request(app).get(`/invoices/500`);
        expect(res.statusCode).toBe(404);
    });
});

describe('Post /invoices', () => {
    test('Post a new invoice', async () => {
        const now = new Date();
        now.setUTCHours(7, 0, 0, 0);
        
        const formattedDate = now.toISOString();

        const res = await request(app).post(`/invoices`).send({
            comp_code: 'rvin',
            amt: 5000
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: { id: expect.any(Number), comp_code: 'rvin', amt: 5000, paid: false, add_date: formattedDate, paid_date: null }
        });
    });
});

describe('Put /companies/:id', () => {
    test('Update an existing invoice', async () => {
        const res = await request(app).put(`/invoices/${testInvoice.id}`).send({
            amt: 200,
            paid: true
        });

        const now = new Date();
        now.setUTCHours(7, 0, 0, 0);
        
        const formattedDate = now.toISOString();
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: { id: testInvoice.id, comp_code: 'rvin', amt: 200, paid: true, add_date: res.body.invoice.add_date, paid_date: formattedDate }
        });

    });

    test('Get a 404 if invoice not found', async () => {
        const res = await request(app).get(`/invoices/500`);
        expect(res.statusCode).toBe(404);
    });
})

describe('Delete /invoices/:id', () => {
    test('Delete a signle invoice', async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'deleted'})
    })
})