import session from 'express-session';

export default session({
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV !== 'dev',
        sameSite: process.env.NODE_ENV === 'PROD' ? 'none' : 'lax'
    }
});
