const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const util = require('util');  // Import util module for promisify
const mysqldump = require('mysqldump');

const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./models/db.js');
var timeout = require('connect-timeout');

app.use(express.static('public'));

const serveIndex = require('serve-index');

app.use('/ftp', express.static('public'), serveIndex('public', { 'icons': true }));
app.use(timeout('10m'));
require('dotenv/config');

app.use(cors());
app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(require('./controller'));
require('express-debug')(app, { /* settings */ });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.listen(process.env.PORT, function () {
  console.log('Connected on port ' + process.env.PORT + '.');
});

// MySQL database configuration
const mysqlConfig = {
  host: '172.16.2.26',
  user: 'root',
  password: 'Default@Ib59',
  database: 'sys',
};

app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  next();
});

const backupDirectory = path.join(__dirname, 'backup');
const mysqldumpAsync = util.promisify(mysqldump); // Promisify mysqldump function

app.post('/mysqlbackup', async (req, res, next) => {
  console.log('Starting MySQL backup process...');
  try {
    // Generate a timestamp for the backup file name
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');

    // Extract only the necessary characters for the file name (excluding milliseconds)
    const formattedTimestamp = timestamp.slice(0, 19).replace(/[:T]/g, '');

    // Specify the backup file path within the 'backups' folder
    const backupFilePath = path.join(backupDirectory, `backup_file1.sql`);
    console.log(`Backup will be stored at: ${backupFilePath}`);

    // Use mysqldump to create a backup
    const result = await mysqldumpAsync({
      connection: mysqlConfig,
      dest: backupFilePath,
    });
    console.log('mysqldump result:', result);

    res.json({ message: 'MySQL Backup successful', backupFilePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
