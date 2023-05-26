'use strict'
/*const {Storage} = require('@google-cloud/storage')
const fs = require('fs')
const dateFormat = require('dateformat')
const path = require('path');
*/

import {Storage} from '@google-cloud/storage'
import fs from 'fs'
import dateFormat from 'dateformat'
import path from 'path'

const pathKey = path.resolve('./serviceaccountkey.json')

// Storage Configuration
const gcs = new Storage({
    projectId: 'winter-sequence-387505',
    keyFilename: pathKey
})

// Bucket Configuration 
const bucketName = 'abji'
const bucket = gcs.bucket(bucketName)

// function getPublicUrl(filename) {
//     return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
// }

let upload = {}

upload.getPublicUrl = (filename) => {
    return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
}

upload.uploadStorage = (req, res, next) => {
    if (!req.file) {
        res.status(400).send({message: 'Please Upload An Image!'})
        return next()
    }

    const gcsname = String(req.params.detail_id)+'-'+String(dateFormat(new Date(), "yyyy-mm-dd-HHMMss"));
    const file = bucket.file(gcsname)

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    })

    stream.on('error', (err) => {
        req.file.cloudStorageError = err
        res.status(500).send({message: err})
        next(err)
    })

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname
        req.file.cloudStoragePublicUrl = upload.getPublicUrl(gcsname)
        next()
    })
    stream.end(req.file.buffer);
    res.status(200).json({
        message: 'An Image Successfully Uploaded!',
        link: gcsname
    })
}

async function deleteFile(fileName) {
    await storage.bucket(bucketName).file(fileName).delete();
    res.status(200).json({
        message: 'An Image Successfully Deleted!'
    })
}

upload.deleteImg = (req, res) => {
    const gcsname = String(req.params.fileName)
    deleteFile(gcsname).catch((error)=>{
        res.status(500).send({message:'Cannot delete the image!'})
    });
}

export {upload}