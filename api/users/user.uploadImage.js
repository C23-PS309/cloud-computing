'use strict'
const {Storage} = require('@google-cloud/storage')
const fs = require('fs')
const dateFormat = require('dateformat')
const path = require('path');
const { json } = require('express');
const bodyParser = require('body-parser');


// import { Storage } from '@google-cloud/storage'
// import fs from 'fs'
// import dateFormat from 'dateformat'
// import path from 'path'

const pathKey = path.resolve('./serviceaccountkeys.json')

// Storage Configuration
const gcs = new Storage({
    projectId: 'capstoneproject-c23-ps309',
    keyFilename: pathKey
})

// Bucket Configuration 
const bucketName = 'pasin-dataset'
const bucket = gcs.bucket(bucketName)

// function getPublicUrl(filename) {
//     return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
// }

let upload = {}

upload.getPublicUrl = (filename) => {
    return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
}

upload.uploadStorage = (req, response, next) => {
    if (!req.file) {
        response.send({ message: 'Please Upload An Image!' })
        return next()
    }

    const tanggal =  dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    const gcsname = String(req.params.id) + '-' + String(tanggal).replace(' ','');
    const file = bucket.file(gcsname)

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    })

    stream.on('error', (err) => {
        req.file.cloudStorageError = err
        response.status(500).send({message: err})
        next(err)
    })

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname
        req.file.cloudStoragePublicUrl = upload.getPublicUrl(gcsname)
        next()
    })
    stream.end(req.file.buffer);
    const link = String(upload.getPublicUrl(gcsname));
    const result = {"link":link,"date":tanggal}
    return result
    // response.json({
    //     message: 'An Image Successfully Uploaded!',
    //     link: upload.getPublicUrl(gcsname),
    //     date: tanggal
    // })
}

async function deleteFile(fileName) {
    await gcs.bucket(bucketName).file(fileName).delete();
    return {
        message: 'An Image Successfully Deleted!'
    }
}

upload.deleteImg = (req, res) => {
    return deleteFile(String(req.body.link_gambar).slice(45)).catch((error) => {
        return { 'message': 'Cannot delete the image!', 'error':error }
    });
}

module.exports = {
    upload
}