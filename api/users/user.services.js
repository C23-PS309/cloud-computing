const pool = require("../../config/database");
const { customAlphabet } = require('nanoid');
const { genSaltSync, hashSync } = require('bcrypt');
const generateUserId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 15);

const create = (data, callBack) => {
    const userId = `user-${generateUserId()}`;
    const salt = genSaltSync(5);
    let password = data.password;
    if (password.length > 20) {
        password = password.slice(0, 20); 
    }

    const hashedPassword = hashSync(password, 5);

    pool.query(
        `INSERT INTO user (user_id, name, email, password)
        VALUES (?, ?, ?, ?)`,
        [userId, data.name, data.email, hashedPassword],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
};

const getUsers = (callBack) => {
    pool.query(
        `SELECT user_id, name, email, password FROM user`,
        [],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
};

const getUserByUserId = (user_id, callBack) => {
    pool.query(
        `SELECT user_id, name, email, password FROM user WHERE user_id = ?`,
        [user_id],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            if (results.length === 0) {
                return callBack(null, null);
            }
            return callBack(null, results[0]);
        }
    );
};

const getUserByUserEmail = (email, callBack) => {
    pool.query(
        `SELECT * FROM user WHERE email = ?`,
        [email],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results[0]);
        }
    );
};

const getUserByUserPassword = (password, callBack) => {
    pool.query(
        `SELECT * FROM user WHERE password = ?`,
        [password],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results[0]);
        }
    );
};

module.exports = {
    create,
    getUsers,
    getUserByUserId,
    getUserByUserEmail,
    getUserByUserPassword
};
