global.baseDir = __dirname;
global.CONFIG = require("./config.js");
global.SECRETS = require("./secrets.js");

const path = require('path');
const https = require("https");
const express = require("express");
const app = express();
const cors = require('cors');

const { getModifiedIndex } = require(baseDir + "/src/Middlewares/misc-middlewares");
const { sessionMiddleware } = require(baseDir + '/src/Middlewares/session-middlewares');

app.use(cors({origin: true, credentials: true}));
app.use(express.json({limit: '500kb'}));
app.use(express.urlencoded({limit: '500kb', extended: true}));


if (SECRETS.TRUST_ALL_PROXY === "true")
    app.set('trust proxy', true);
else if (SECRETS.TRUST_PROXY)
    app.set('trust proxy', CONFIG.TRUST_PROXY)

app.use(sessionMiddleware)

// Routes
app.use("/api/", require('./routes/user-routes'));
app.use("/api/", require('./routes/board-routes'));
app.use("/api/", require('./routes/event-routes'));
app.use("/api/admin/", require('./routes/admin-routes'));

// Public folder
app.use(express.static(path.join(__dirname, '../frontend/build'), {index: false}));

app.use('*', getModifiedIndex)
app.get('*', (req, res) => {
    res.send(req.modifiedIndex);
});

app.listen(CONFIG.PORT, CONFIG.HOST, function() {
    console.log(`App listening on port ${CONFIG.PORT}`);
});
