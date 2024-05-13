const express = require('express')
const router = new express.Router()
const expressError = require("../expressError")

const db = require("../db")
const ExpressError = require('../expressError')

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
        SELECT code, name, description
        FROM companies
        WHERE code=$1`,[req.params.code])

        if (results.rows.length === 0){
            throw new ExpressError(`A company with the code of ${req.params.code} does not existing`, 404)
        }

        return res.json({"company": results.rows})
    }
    catch(err){
        return next(err)
    }

})

router.post('/', async (req, res, next) =>{
    try{
        const {name, description} = req.body

        const results = await db.query(`
        INSERT INTO companies(name, description)
        VALUES($1, $2)
        RETURNING code, name, type`,[name, type])
        return res.status(201).json({"company": {name, description}})
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