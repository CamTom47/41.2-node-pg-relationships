const express = require("express")
const db = require("../db")
const ExpressError = require("../expressError")
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

        let {amt, paid} = req.body;
        let id = req.params.id
        let paidDate = null;

        let currResults = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id = $1`, [id]
        )

        let currPaidDate = currResults.rows[0].paid_date;

        if (!currPaidDate && paid){
            paidDate = new Date();
        } else if (!paid){
            paidDate = null
        } else {
            paidDate = currPaidDate
        }

        if (currResults.rows.length === 0){
            throw new ExpressError(`No invoice id of ${id}`, 404);
        }


        
        let results = await db.query(`
        UPDATE invoices
        SET amt = $1 , paid = $2 , paid_date $3
        WHERE id = $4
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, paid, paidDate, id])
        
        if (results.rows.length === 0 ){
            throw ExpressError(`Cannot find invoice ${id}`, 404)
        }

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