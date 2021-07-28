const Pool = require('pg').Pool

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres123",
    database: "MGP-DB"
})

module.exports = {
    pool
}