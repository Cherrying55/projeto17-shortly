import { db } from "../connections/db.js";
import { hashSync, compareSync } from "bcrypt";
import { v4 as uuid } from "uuid";

export async function signUp (req,res){

    const {name,email,password,confirmPassword} = req.body;

    if(password !== confirmPassword){
        return res.sendStatus(422)
    }
    try{
        const userdb = await db.query(
           `SELECT * FROM usuarios WHERE email=$1`
            ,[email]);
        if (userdb.rows.length !== 0){
             return res.sendStatus(409)
        };
        const hashpass = hashSync(password, 10);
        const novousuario = await db.query(
            `INSERT INTO usuarios (name, email, password) VALUES ($1, $2, $3)`,
            [name, email, hashpass]
        );
        return res.sendStatus(201);
    }
    catch(err){
        return res.status(500).send(err.message);
    }

    
}

export async function signIn(req,res){
    const {email, password} = req.body;
    
    try {
        
        const usuarioexistente = await db.query(
            `SELECT * FROM usuarios WHERE email=$1`
        ,[email]);
        if(usuarioexistente.rows.length !== 0){
            console.log(compareSync(password, usuarioexistente.rows[0].password))
            const correctpass = compareSync(password, usuarioexistente.rows[0].password);
                if(correctpass){
                const token = uuid();

                await db.query(
                    `INSERT INTO sessions (token, userId) VALUES ($1, $2)`, [token, usuarioexistente.rows[0].id]
                );
                return res.send({token})
            }
            else{
                return res.sendStatus(401);
            }
        }
        else{
            return res.sendStatus(401);
        }

    } catch (error) {
        return res.status(500).send(err.message);
    }

}

export async function getUserData (req,res){

    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if(!authorization){
        return res.sendStatus(401)
    }

    try {
        const session = await db.query(`
         SELECT * FROM sessions WHERE token=$1
        `,[token]);
        if(session.rows.length === 0){
            return  res.sendStatus(401)
        }
        console.log(session.rows);
        const user = await db.query(`
        SELECT * FROM usuarios WHERE id=$1
        `,[session.rows[0].userid]);
        console.log(user.rows);
        const userid = user.rows[0].id;
        const links = await db.query(
            `SELECT
            id, shortUrl, url, visitCount
            FROM links
            WHERE userId = $1`, [userid]
        );
        const visitcountquery = await db.query(`SELECT SUM(links.visitCount) FROM links WHERE userId= $1;`,
        [userid]);
        const visitcount = visitcountquery.rows[0].sum;
        let obj = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            visitCount: visitcount,
            shortenedUrls: links.rows
        }
        return res.send(obj)
        
    } catch (error) {
        return res.status(500).send(err.message);
    }
}

export async function getRanking (req,res){

    try {
        
        const ranks = await db.query(
            `SELECT 
            usuarios.id, 
            usuarios.name, 
            COUNT(links.id) as "linksCount", 
            COALESCE(SUM(links.visitCount), 0) as "visitCount"
          FROM usuarios
          LEFT JOIN links ON links.userId = usuarios.id
          GROUP BY usuarios.id
          ORDER BY "visitCount" DESC
          LIMIT 10
            `
        );
        res.send(ranks.rows).status(200);

    } catch (error) {
        return res.status(500).send(err.message);
    }
}

