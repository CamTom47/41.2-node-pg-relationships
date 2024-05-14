const express = require('express')
const router = new express.Router()

const db = require("../db")
const ExpressError = require('../expressError')
const { default: slugify } = require('slugify')

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`
        SELECT code, name 
        FROM companies`)
        return res.json({"companies": results.rows})
    }
    catch(err){
        return next(err)
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        
        const results = await db.query(`
        SELECT c.code, c.name, c.description, i.industry
        FROM companies AS c
        JOIN companies_industries AS ci
        ON c.code = ci.company_id
        JOIN industries AS i
        ON ci.industry_id = i.id
        WHERE c.code=$1`,[req.params.code])
        
        const {code, name, description} = results.rows[0];

        
        const industries = results.rows.map(r => r.industry)
        
        if (results.rows.length === 0){
            throw new ExpressError(`A company with the code of ${req.params.code} does not existing`, 404)
        }

        return res.json({"company": code, name, description, industries})
    }
    catch(err){
        return next(err)
    }

})

router.post('/', async (req, res, next) =>{
    try{
        const {name, description} = req.body

        code = slugify(name, {
            replacement: '_',
            remove: undefined,
            lower: true,
            trim: true
        })

        const results = await db.query(`
        INSERT INTO companies(name, description)
        VALUES($1, $2, $3)
        RETURNING code, name, type`,[code, name, type])
        return res.status(201).json({"company": {code, name, description}})
    }

    
    catch(err){
        err.status(404)
        next(err)
    }
} )

router.put('/:code', async (req, res, next) =>{
    try{
        const {name, description} = req.body
        const results = await db.query(`
        UPDATE companies name=$1, description=$2
        WHERE code=$3`, [name, description, req.params.code]);

        return res.json({"company": results.rows[0]})
    }
    catch{
        next(err)
    }
})

router.delete('/:code', async (req, res, next) => {
    try{
        const results = await db.query(`
        DELETE FROM companies
        WHERE code = $1`, [req.params.code]);

        return res.json({"status": "Deleted"})
    }
    catch(err){
        next(err)
    }
})

module.exports = router;