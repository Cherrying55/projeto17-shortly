import { db } from "../connections/db.js";
import { nanoid } from "nanoid";

export async function postShorten (req,res){

    const { authorization } = req.headers;
    const { url } = req.body;
    const token = authorization?.replace('Bearer ', '');
    console.log(token)

    if(!authorization){
        return res.sendStatus(401)
    }

    try {
        const session = await db.query(`
         SELECT * FROM sessions WHERE token=$1
        `,[token]);
        console.log(session.rows);
        if(session.rows.length === 0){
            return  res.sendStatus(401)
        }
        const short = nanoid();
        const post = await db.query(`
        INSERT INTO links (url, userId, shortUrl, visitCount) VALUES ($1, $2, $3, $4)
        `, [url, session.rows[0].userid, short, 0]);
        const pegarid = await db.query(`
        SELECT * FROM links WHERE url=$1`,[url]);

        return res.send({id: pegarid.rows[0].id, shortUrl: short}).status(201);
        
    } catch (error) {
        return res.status(500).send(err.message);
    }
}

export async function getUrlbyId(req,res){
    const id = parseInt(req.params.id);
  
    if (!id) return res.sendStatus(404);

    try {
        
        const query = await db.query(`
        SELECT * FROM links WHERE id=$1
        `, [id]);
        const url = query.rows[0];
        return res.send({id: url.id, shortUrl: url.shorturl, url: url.url }).status(200);

    } catch (error) {
        return res.status(500).send(err.message);
    }
}

export async function deleteURL (req,res){
    const id = parseInt(req.params.id);
  
    if (!id) return res.sendStatus(401);

    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');
    console.log(token)

    if(!authorization){
        return res.sendStatus(401)
    }

    try {
        const session = await db.query(`
         SELECT * FROM sessions WHERE token=$1
        `,[token]);
        if(session.rows.length === 0){
            return  res.sendStatus(401)
        };
        const pertence = await db.query(`
        SELECT * FROM links WHERE id=$1
        `,[id]);
        if(pertence.rows[0].userid !== session.rows[0].userid){
            return res.sendStatus(401)
        }
        const query = await db.query(
            `DELETE FROM links WHERE id=$1`
        ,[id]);
        if(pertence.rows.length === 0) return res.sendStatus(404);
        return res.sendStatus(204);

        
    } catch (error) {
        return res.status(500).send(err.message);
    }

}

export async function openURL(req,res){

    const { shortUrl } = req.params

    console.log(req.params);
  
    if (!shortUrl) return res.sendStatus(401);

    try {
        const query = await db.query(`
        SELECT * FROM links WHERE shorturl=$1
        `,[shortUrl]);
        console.log(query.rows);
        if(query.rows.length === 0 ){
            return res.sendStatus(404);
        }
        const id = query.rows[0].id;
        const update = await db.query(`
        UPDATE links SET visitCount=$1 WHERE id=$2
        `, [query.rows[0].visitcount + 1, query.rows[0].id]);
        return res.redirect(query.rows[0].url)
        

    } catch (error) {
        return res.status(500).send(err.message);
    }

}