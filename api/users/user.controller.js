const { create, getUserByUserId, getUsers, getUserByUserEmail } = require("./user.services");
const { genSaltSync, hashSync, compare, compareSync } = require("bcrypt");
const { upload } = require("./user.uploadImage")
const { sign } = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const pool = require("../../config/database");

const createUser = (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    getUserByUserEmail(body.email, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Koneksi Database Error",
            });
        }

        if (user) {
            return res.status(400).json({
                success: 0,
                message: "Pengguna dengan email ini telah terdaftar",
            });
        }

        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Koneksi Database Error",
                });
            }
            return res.status(200).json({
                error: false,
                message: "Registrasi Berhasil",
            });
        });
    });
};

const getUserByUserIdHandler = (req, res) => {
    const id = req.params.id;
    getUserByUserId(id, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Koneksi Database Error",
            });
        }
        if (!results) {
            return res.json({
                success: 0,
                message: "Data Pengguna tidak Ditemukan",
            });
        }
        results.password = undefined;
        return res.json({
            success: 1,
            data: results,
        });
    });
};

const getUsersHandler = (req, res) => {
    getUsers((err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Koneksi Database Error",
            });
        }
        return res.json({
            success: 1,
            data: results,
        });
    });
};

const login = (req, res) => {
    const body = req.body;
    const email = body.email;
    const password = body.password;
    getUserByUserEmail(email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Koneksi Database Error",
            });
        }
        if (!results) {
            return res.json({
                error: true,
                message: "Email Anda salah!",
            });
        } 
        const isPasswordValid = compare(password, results.password);
        const isEmailValid = email.toLowerCase() === results.email.toLowerCase();

        if (isPasswordValid && isEmailValid) {
            results.password = undefined;
            const jsontoken = sign({ result: results }, "qwe1234");
            return res.json({
                error: false,
                message: "success",
                loginResult: {
                    userId: results.user_id,
                    name: results.name,
                    token: jsontoken,
                },
            });
        } else {
            return res.json({
                error: true,
                message: "Password Anda Salah!"
            });
        }
    });
};

const dashboard = (user_id, callback) => {
    const query = `SELECT d.detail_id, d.umur, d.height, d.link_gambar, d.tanggal_pengukuran, m.shoulders_width, m.hip_width, m.result 
                    from userDetail d, userMeasurement m WHERE d.detail_id = m.detail_id 
                    AND d.user_id = ? order by tanggal_pengukuran desc LIMIT 1`;
    pool.query(query, [user_id], (error, rows, field) => {
        if (error) {
            return callback(error);
        }
        if (rows.length === 0) {
            return callback(null, null);
        }
        return callback(null, rows);
    });
};

const history = (user_id, callback) => {
    const query = `SELECT d.detail_id, d.umur, d.height, d.link_gambar, d.tanggal_pengukuran, m.shoulders_width, m.hip_width, m.result 
                    from userDetail d, userMeasurement m WHERE d.detail_id = m.detail_id 
                    AND d.user_id = ? order by tanggal_pengukuran desc`;
    pool.query(query, [user_id], (error, rows, field) => {
        if (error) {
            return callback(error);
        }
        if (rows.length === 0) {
            return callback(null, null);
        }
        return callback(null, rows);
    });
};

const historyById = (detail_id, callback) => {
    const query = "SELECT * FROM userDetail d, userMeasurement m WHERE d.detail_id = m.detail_id AND d.detail_id = ?";
    pool.query(query, [detail_id], (error, rows, field) => {
        if (error) {
            return callback(error);
        }
        if (rows.length === 0) {
            return callback(null, null);
        }
        return callback(null, rows);
    });
}

const postDataAwal = (user_id, gender, height, umur, req, res, callback) => {
    const detail_id = String(nanoid(8));
    const query = "INSERT INTO userDetail VALUES (?, (select user_id from user where user_id = ?), 'Tanpa Judul', ?, ?, ?, ?, ?)";
    const result = upload.uploadStorage(req, res, callback);

    pool.query(query, [detail_id, user_id, result.date, gender, result.link, height, umur], (err, rows, fields) => {
        if (err) {
            res.status(500).json({ 
                error: true, 
                message: "Gagal Menambahkan Data" 
            });
            return callback(err);
        } else {
            res.json({ 
                error: false,
                message: "Berhasil Mengupload Data", 
                detail_id: detail_id 
            });
            return callback(null, "Gambar Berhasil Diupload", detail_id, rows);
        }
    });
}

const postMeasurementData = (detail_id, hip, shoulders, result, callback) => {
    const query = "INSERT INTO userMeasurement VALUES (?, ?, ?, ?)";
    pool.query(query, [detail_id, hip, shoulders, result], (err, rows, fields) => {
        if (err) {
            callback(err);
        } else {
            callback(null, "Measurement data inserted successfully!");
        }
    });
};

const updateHistoryName = (detail_id, nama_history, callback) => {
    const query = "UPDATE userDetail SET nama_history = ? WHERE detail_id = ?";
    pool.query(query, [nama_history, detail_id], (err, rows, fields) => {
        if (err) {
            callback(err);
        } else {
            callback(null, "Data updated successfully!");
        }
    });
}

const deleteHistoryData = (detail_id, req, res, callback) => {
    upload.deleteImg(req, res);
    const query = "DELETE FROM userDetail WHERE detail_id = ?";
    pool.query(query, [detail_id], (err, rows, fields) => {
        if (err) {
            callback(err);
        } else {
            callback(null, "Data deleted successfully!");
        }
    });
};


module.exports = {
    createUser,
    getUserByUserIdHandler,
    getUsersHandler,
    login,
    dashboard,
    history,
    historyById,
    postDataAwal,
    postMeasurementData,
    updateHistoryName, 
    deleteHistoryData
};
