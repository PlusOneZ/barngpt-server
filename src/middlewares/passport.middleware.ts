import passport from "passport";
import { Strategy as PassportLocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

import { UserModel } from "../models/user";
import { loginSchema } from "../utils/validators";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}`});

const localLogin = new PassportLocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return done(null, false, { message: error.details[0].message });
        }

        try {
            const user = await UserModel.findOne({ email: email.trim() });
            if (!user) {
                return done(null, false, { message: "Email does not exists"});
            }

            user.comparePassword(password, function (err: Error | null, isMatch: boolean) {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password" })
                }
                return done(null, user)
            })
        } catch (err) {
            return done(err)
        }
    }
)

const jwtLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromHeader('x-auth-token'),
        secretOrKey: process.env.JWT_SECRET!
    },
    async (payload: any, done: any) => {
        try {
            const user = await UserModel.findById(payload.id);

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        } catch (err) {
            done(err, false);
        }
    },
);

const serverUrl = `https://${process.env.HOST}:${process.env.PORT}`

const facebookLogin = new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_SECRET!,
        callbackURL: `${serverUrl}${process.env.FACEBOOK_CALLBACK_URL!}`,
        profileFields: [
            'id',
            'email',
            'gender',
            'profileUrl',
            'displayName',
            'locale',
            'name',
            'timezone',
            'updated_time',
            'verified',
            'picture.type(large)',
        ],
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const oldUser = await UserModel.findOne({ email: profile.emails![0].value });

            if (oldUser) {
                return done(null, oldUser);
            }
        } catch (err) {
            console.log(err);
        }

        // register user
        try {
            const newUser = new UserModel({
                provider: 'facebook',
                facebookId: profile.id,
                username: `user${profile.id}`,
                email: profile.emails![0].value,
                name: profile.displayName,
                avatar: profile.photos ? profile.photos![0].value : "",
            });
            await newUser.save();

            done(null, newUser);
        } catch (err) {
            console.log(err);
        }
    },
)

// google strategy
const googleLogin = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${serverUrl}${process.env.GOOGLE_CALLBACK_URL!}`,
        proxy: true,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        // console.log(profile);
        try {
            const oldUser = await UserModel.findOne({ email: profile.email });

            if (oldUser) {
                return done(null, oldUser);
            }
        } catch (err) {
            console.log(err);
        }

        try {
            const newUser = await new UserModel({
                provider: 'google',
                googleId: profile.id,
                username: `user${profile.id}`,
                email: profile.email,
                name: profile.displayName,
                avatar: profile.picture,
            }).save();
            done(null, newUser);
        } catch (err) {
            console.log(err);
        }
    },
);

passport.use(localLogin)
passport.use(jwtLogin)
passport.use(facebookLogin)
passport.use(googleLogin)

export default passport