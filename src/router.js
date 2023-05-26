/*const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const Multer = require('multer');
const upload = require('upload');
*/

import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import {nanoid} from 'nanoid';
import {upload} from './upload.js';
import Multer from 'multer';

var jsonParser = bodyParser.json();
const router = express.Router();

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
});

//sql configuration
const connection = mysql.createConnection({
    host: '34.128.67.102',
    user: 'root',
    database: 'capstone-database',
    password: 'trial'
});

//for MD
//get all detail_id based on user_id
router.get("/dashboard/:id", (req,res)=>{
    var id = String(req.params.id);
    const query = "select d.detail_id from userDetail d, userMeasurement m where d.detail_id = m.detail_id AND user_id = ? order by tanggal_pengukuran desc";
    connection.query(query, [id], (err, rows, field) => {
        if(err){
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
});

//for MD
//get all detail measurment rows based on detail_id
router.get("/history/:detail_id",(req,res)=>{
    const detail_id = String(req.params.detail_id);
    const query = "select * from userDetail d, userMeasurement m where d.detail_id = ? and d.detail_id=m.detail_id";
    connection.query(query, [detail_id], (err, rows, field) => {
        if(err){
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    });
});

//for ML
//get the image link based on detail_id
router.get("/image/:detail_id", (req,res) => {
    const detail_id = String(req.params.detail_id);
    const query = "SELECT link_gambar FROM userDetail WHERE detail_id = ?";
    connection.query(query, [detail_id], (err,rows,field)=>{
        if(err){
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})


//for MD 
//post the gender to database refering to user_id and create the detail_id
router.post("/history/gender/:id",jsonParser,(req,res)=>{
    const user_id =  req.params.id;
    const detail_id = String(nanoid(8));
    const gender = req.body.gender;
    const query = "INSERT INTO userDetail VALUES (?, (select user_id from user where user_id = ?), -, DEFAULT, ?, -)";
    
    connection.query(query, [detail_id, user_id, gender], (err,rows,fields) => {
        if(err){
            res.status(500).send({message: err.sqlMessage});
        }else{
            res.send({
                message: "Insert Into History Successfully",
                detail_id: detail_id
            })
        }
    })
})

//for MD 
//post the image to storage refering to detail_id using multer
router.post("/image/upload/:detail_id", multer.single('image'),upload.uploadStorage);

//for ML
//post the measurement result refering to detail_id
router.post("/history/data/:detail_id",(req,res)=>{
    var detail_id = String(req.params.detail_id);
    var waist = req.body.waist 
    var hip = req.body.hip
    var chest = req.body.chest
    var height = req.body.height
    var result = req.body.result
    const query = "INSERT INTO userMeasurement VALUES (?,?,?,?,?,?)";
    connection.query(query, [detail_id,waist,hip,chest,height,result], (err,rows,fields) => {
        if(err){
            res.status(500).send({message: err.sqlMessage});
        }else{
            res.send({message: "Insert Into Measurement Successfully!"})
        }
    })
})

//for MD
//updating image if there's a failure before send it to ML 
//based on detail_id and the date from image that uploaded before
router.patch("/image/update/:detail_id-:date", multer.single('image'),(req,res,next) => {
    upload.deleteImg(req,res);
    upload.uploadStorage(req,res,next);
});

//for MD
//insert all the left history data (nama_history and link_gambar) 
//based on detail and date from image link
router.patch("/history/data/:detail_id-:date", jsonParser, (req, res) =>{
    const detail_id =  req.params.detail_id;
    const nama_history = req.body.nama_history;
    const fileName = detail_id+'-'+req.params.date;
    var link_gambar = upload.getPublicUrl(fileName);

    const query = "UPDATE userDetail SET nama_history=?, link_gambar=? WHERE detail_id=?";

    connection.query(query, [nama_history, link_gambar, detail_id], (err,rows,fields) => {
        if(err){
            res.status(500).send({message: err.sqlMessage});
        }else{
            res.send({message: "Insert Into History Successfully"})
        }
    })
});

//for MD
//deleting all data history based on detail_id
router.delete("/history/data/:detail_id", (req,res)=>{
    var detail_id = String(req.params.detail_id);
    const query = "DELETE FROM userMeasurement WHERE detail_id = ?; DELETE FROM userDetail WHERE detail_id = ?";
    connection.query(query,[detail_id,detail_id],(err, rows, fields)=>{
        if(err){
            res.status(500).send({message: err.sqlMessage});
        }else{
            res.send({message: "Data Deleted Successfully!"})
        }
    })
})

export {router}