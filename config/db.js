var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost', //'13.229.86.120',//,
    user: 'root',
    port: '3306',
    password: '', //Token@qw!@ 'ahextech',//'',
    database: 'studentflights'
});

connection.connect(function(err, connection) {
    if (err) {
        connection.release();
        res.json({ "code": 100, "status": "Error in connection database" });
        return;
    }
    console.log('connected as id ' + connection.threadId);

});

module.exports = connection;