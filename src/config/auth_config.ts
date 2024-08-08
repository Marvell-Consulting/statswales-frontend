import dotenv from 'dotenv';
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export interface User {
    id: string;
    displayName: string;
}

dotenv.config();
const users: User[] = [];

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'client_secret',
            callbackURL: '/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
            let user = users.find((usr) => usr.id === profile.id);
            if (!user) {
                user = { id: profile.id, displayName: profile.displayName };
                users.push(user);
            }
            return done(null, user);
        }
    )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
    const user = users.find((usr) => usr.id === id);
    done(null, user);
});

export default passport;
export const auth = Router();

auth.get('/login', (req, res) => {
    res.render('login');
});

auth.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line consistent-return
    req.logout((err): void => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

auth.get('/google', passport.authenticate('google', { scope: ['profile'] }));

auth.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    if (req.cookies.returnTo) {
        res.redirect(req.cookies.returnTo);
    } else {
        res.redirect('/');
    }
});
