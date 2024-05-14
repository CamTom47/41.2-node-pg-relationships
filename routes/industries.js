const express = require('express')
const router = new express.Router()
const ExpressError = require("../expressError")

const db = require("../db")

router.get("/", async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT ind_code, industry
            FROM industries`
        )

        if(results.rows.length === 0){
            throw ExpressError('Industries not found', 404)
        }

            return res.json({"industries": results.rows})

    } catch(err){
        next(err)
    }
})

router.post('/', async (req, res, next) =>{
    try{

        const {ind_code, industry} = req.body

        const results = await db.query(
            `INSERT INTO industries(ind_code, industry)
            VALUES($1, $2)
            RETURNING ind_code, industry`, [ind_code, industry]
        )

        return res.status(201).json({"industry": ind_code, industry})

    } catch(err){
        next(err)
    }
})

router.post('/:id', async (req, res, next) => {
    try{
        let {code} = req.body

        let ind_id = await db.query(
            `SELECT id
            FROM industries
            WHERE ind_code = $1`, [req.params.id]
        )


        let results = await db.query(
            `INSERT INTO companies_industries
            VALUES ($1, $2)`, [code, ind_id])

            return res.json(results.rows[0])

    } catch(err){
        next(err)
    }
} )

module.exports = router;