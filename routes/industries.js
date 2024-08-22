const express = require('express');
const slugify = require('slugify')
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');


// Get /
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT i.industry, 
                    COALESCE(array_agg(ci.company_code), '{}') AS companies
             FROM industries AS i
             LEFT JOIN company_industries AS ci ON i.code = ci.industry_code
             GROUP BY i.industry`
        );

        return res.json({ industries: results.rows });
    } catch (e) {
        next(e);
    }
});

// Post /
router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const code = slugify(industry, {lower: true});
        
        const result = await db.query(
            `INSERT INTO industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`,
            [code, industry]
        );

        return res.status(201).json({ industry: result.rows[0] });
    } catch (e) {
        next(e);
    }
});


// Post /:company_code
router.post('/:company_code', async (req, res, next) => {
    try {
        const { company_code } = req.params;
        const { industry_code } = req.body;

        const result = await db.query(
            `INSERT INTO company_industries (company_code, industry_code)
             VALUES ($1, $2)
             RETURNING company_code, industry_code`,
            [company_code, industry_code]
        );

        return res.status(201).json({ company_industry: result.rows[0] });
    } catch (e) {
        next(e);
    }
});


module.exports = router;