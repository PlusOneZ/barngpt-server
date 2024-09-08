import passport from "passport";
import { Strategy as PassportLocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

import { UserModel } from "../models/user";
import { BUserModel } from "../models/businessUser.model";
import { loginSchema, businessLoginSchema } from "../utils/validators";
import { log } from "../utils/logging";
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

const businessLocalLogin = new PassportLocalStrategy(
    {
        usernameField: 'identifier',
        passwordField: 'password',
        session: false,
        passReqToCallback: true
    },
    async (req, identifier, password, done) => {
        const { error } = businessLoginSchema.validate(req.body);
        if (error) {
            return done(null, false, { message: error.details[0].message });
        }

        try {
            const bUser = await BUserModel.findOne({ identifier: identifier.trim() });
            if (!bUser) {
                return done(null, false, { message: "Identifier does not exists"});
            }

            if (bUser.identifier === "admin" && bUser.password === password) {
                return done(null, bUser)
            }

            bUser.comparePassword(password, function (err: Error | null, isMatch: boolean) {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password" })
                }
                return done(null, bUser)
            })
        } catch (err) {
            return done(err)
        }
    }
)

const jwtLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET!
    },
    async (payload: any, done: any) => {
        // check if expired
        if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
            log.info(`Token expired ${Date.now()} > ${payload.exp}`)
            return done(new Error("Dirty token or token expired"), false)
        }
        UserModel.findOne({ "email": payload.email }).then(function ( user) {
            if (user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        }).catch(function (err) {
            return done(err, false)
        });

    },
);

const jwtBusinessLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET!,
        passReqToCallback: true,
    },
    async (req: any, payload: any, done: any) => {
        // check if expired
        // TODO: buser might need longer expiration limit
        if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
            log.info(`Token expired ${Date.now()} > ${payload.exp}`)
            return done(new Error("Dirty token or token expired"), false)
        }
        BUserModel.findOne({ "identifier": payload.identifier }).then(function ( user) {
            if (user) {
                // log(`user: ${user}`)
                req.user = payload
                return done(null, user)
            } else {
                return done(null, false)
            }
        }).catch(function (err) {
            return done(err, false)
        });

    },
);

const serverUrl = process.env.HOST_URL!;

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
            log.error(err);
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
            log.error(err);
        }
    },
)

// google strategy
const googleLogin = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${serverUrl}${process.env.GOOGLE_CALLBACK_URL!}`,
        // passReqToCallback: true,
        // proxy: true,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        log.info(profile);
        try {
            const oldUser = await UserModel.findOne({ email: profile.email });

            if (oldUser) {
                return done(null, oldUser);
            }
        } catch (err) {
            log.error(err);
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
            log.error(err);
        }
    },
);

passport.use(localLogin)
passport.use(jwtLogin)
passport.use(facebookLogin)
passport.use(googleLogin)

passport.use("business-local", businessLocalLogin)
passport.use("business-jwt", jwtBusinessLogin)

export default passport