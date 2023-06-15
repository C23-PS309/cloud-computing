const {
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
} = require("./user.controller")
const router = require("express").Router()
const { checkToken } = require("../../auth/validation")
const Multer = require("multer")
const bodyParser = require("body-parser")

var jsonParser = bodyParser.json();
const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
});

router.post("/register", createUser);
router.post("/login", login);
router.get("/users", checkToken, getUsersHandler);
router.get("/user/:id", checkToken, getUserByUserIdHandler);

// Routes for dashboard
router.get("/dashboard/:user_id", checkToken, (req, res) => {
    const user_id = String(req.params.user_id);
    dashboard(user_id, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: true, 
                message: "Koneksi Database Error",
            });
        }
        if (!rows) {
            return res.status(400).json({
                error: true,
                message: "Data Pengguna tidak Ditemukan",
                data: rows
            });
        }
        rows.password = undefined;
        return res.json({
            error: false,
            message: "success",
            data: rows,
        });
    });
});

// Routes for history
router.get("/history/:user_id", checkToken, (req, res) => {
    const user_id = String(req.params.user_id);
    history(user_id, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: true,
                message: "Koneksi Database Error",
            });
        }
        if (!rows) {
            return res.status(400).json({
                error: true,
                message: "Data Pengguna tidak Ditemukan",
                data: null,
            });
        }
        rows.password = undefined;
        return res.json({
            error: false,
            message: "success",
            data: rows,
        });
    });
});

// Routes for detail history
router.get("/history/data/:detail_id", checkToken, (req, res) => {
    const detail_id = String(req.params.detail_id);
    historyById(detail_id, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: true,
                message: "Koneksi Database Error",
            });
        }
        if (!rows) {
            return res.status(400).json({
                error: true,
                message: "Data Pengguna tidak Ditemukan",
                data: null
            });
        }
        rows.password = undefined;
        return res.json({
            error: false,
            message: "success",
            data: rows,
        });
    });
});

// Routes for upload data history
router.post("/history/:user_id", checkToken, jsonParser, multer.single('image'), (req, res, next) => {
    const user_id = req.params.user_id;
    const gender = req.body.gender;
    const height = req.body.height;
    const umur = req.body.umur;
    postDataAwal(user_id, gender, height, umur, req, res, next, (err, detail_id) => {
        if (err) {
            res.status(500).send({ message: err.sqlMessage });
        } else {
            res.send({
                error: false,
                message: "Berhasil Menambahkan History",
                detail_id: detail_id
            });
        }
    });
});

// Routes for measurement data
router.post("/result/:detail_id", checkToken, (req, res) => {
    const detail_id = String(req.params.detail_id);
    const hip = req.body.hip;
    const shoulders = req.body.shoulders;
    const result = req.body.result;
    postMeasurementData(detail_id, hip, shoulders, result, (err, message) => {
        if (err) {
            res.status(500).json({ 
                error: true,
                message: "Gagal Menambahkan Data Pengukuran"
            });
        } else {
            res.send({ message: "Berhasil Menambahkan Data Pengukuran" });
        }
    });
});

//update history name
router.patch("/history/data/:detail_id", checkToken, (req, res) => {
    const detail_id = String(req.params.detail_id);
    const nama_history = req.body.nama_history;
    updateHistoryName(detail_id, nama_history, (err, message) => {
        if (err) {
            res.status(500).send({ message: err.sqlMessage });
        } else {
            res.send({ message: "Berhasil mengupdate Data!" });
        }
    });
});


// Routes for deleting history data
router.delete("/history/data/:detail_id", checkToken, (req, res) => {
    const detail_id = String(req.params.detail_id);
    deleteHistoryData(detail_id, req, res, (err, message) => {
        if (err) {
            res.status(500).send({ message: err.sqlMessage });
        } else {
            res.send({ message: "Berhasil menghapus Data!" });
        }
    });
});

module.exports = router