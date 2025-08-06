const session = require("express-session");
const sqlStore = require("express-mysql-session")(session);

const { pool, queryDb } = require(baseDir + "/src/utils/db.js")

const sessionStore = new sqlStore({}, pool);

sessionStore.onReady().then(async () => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});

const sessionMiddleware = session({
    secret: SECRETS.SESSION_STORE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 10000,
        sameSite: SECRETS.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: SECRETS.NODE_ENV === 'production'
    }
});

module.exports = { sessionMiddleware };