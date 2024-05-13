const express = require("express")
const db = require("../db")
const router = new express.Router()

router.get('/', async (req, res, next) => {
    try{

        let results = await db.query(`
        SELECT id, comp_code 
        FROM invoices`)
        
        return res.json({"invoices": results.rows})
    }
    catch(err){
        next(err)
    }
})

router.get('/:id', async (req, res, next) => {
    try{

        let results = await db.query(`
        SELECT * FROM invoices
        WHERE id = $1`,[req.params.id])
        
        return res.json({"invoice": results.rows[0]})
    }
    catch(err){
        err.status(404)
        next(err)
    }
})

router.post('/', async (req, res, next) =>  {
    try{
        let results = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date
        `[comp_code, amt])

        return res.json({"invoice": results.rows})
    }
    catch(err){
        next(err)
    }
})

router.put('/:id', async (req, res, next) =>{
    try{
        let results = await db.query(`
        UPDATE invoices 
        WHERE id = $1`,[req.params.id])

        return res.json({"invoice": results.rows[0]})
    }
    catch(err){
        next(err)
    }
})

router.delete('/id', async (req, res, next) =>{
    try{
        let results = await db.query(`
        DELETE FROM invoices
        WHERE id = $1`, [req.params.id])

        return res.json({"status": "deleted"})
    }
    catch(err){
        next(err)
    }
})




module.exports = router;