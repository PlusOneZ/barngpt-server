"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const passport_facebook_1 = require("passport-facebook");
const passport_google_oauth2_1 = require("passport-google-oauth2");
const user_1 = require("../models/user");
const businessUser_model_1 = require("../models/businessUser.model");
const validators_1 = require("../utils/validators");
const logging_1 = require("../utils/logging");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const localLogin = new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, async (req, email, password, done) => {
    const { error } = validators_1.loginSchema.validate(req.body);
    if (error) {
        return done(null, false, { message: error.details[0].message });
    }
    try {
        const user = await user_1.UserModel.findOne({ email: email.trim() });
        if (!user) {
            return done(null, false, { message: "Email does not exists" });
        }
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        });
    }
    catch (err) {
        return done(err);
    }
});
const businessLocalLogin = new passport_local_1.Strategy({
    usernameField: 'identifier',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, async (req, identifier, password, done) => {
    const { error } = validators_1.businessLoginSchema.validate(req.body);
    if (error) {
        return done(null, false, { message: error.details[0].message });
    }
    try {
        const bUser = await businessUser_model_1.BUserModel.findOne({ identifier: identifier.trim() });
        if (!bUser) {
            return done(null, false, { message: "Identifier does not exists" });
        }
        if (bUser.identifier === "admin" && bUser.password === password) {
            return done(null, bUser);
        }
        bUser.comparePassword(password, function (err, isMatch) {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, bUser);
        });
    }
    catch (err) {
        return done(err);
    }
});
const jwtLogin = new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    // check if expired
    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
        logging_1.log.info(`Token expired ${Date.now()} > ${payload.exp}`);
        return done(new Error("Dirty token or token expired"), false);
    }
    user_1.UserModel.findOne({ "email": payload.email }).then(function (user) {
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }).catch(function (err) {
        return done(err, false);
    });
});
const jwtBusinessLogin = new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
}, async (req, payload, done) => {
    // check if expired
    // TODO: buser might need longer expiration limit
    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
        logging_1.log.info(`Token expired ${Date.now()} > ${payload.exp}`);
        return done(new Error("Dirty token or token expired"), false);
    }
    businessUser_model_1.BUserModel.findOne({ "identifier": payload.identifier }).then(function (user) {
        if (user) {
            // log(`user: ${user}`)
            req.user = payload;
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }).catch(function (err) {
        return done(err, false);
    });
});
const serverUrl = process.env.HOST_URL;
const facebookLogin = new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: `${serverUrl}${process.env.FACEBOOK_CALLBACK_URL}`,
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
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const oldUser = await user_1.UserModel.findOne({ email: profile.emails[0].value });
        if (oldUser) {
            return done(null, oldUser);
        }
    }
    catch (err) {
        logging_1.log.error(err);
    }
    // register user
    try {
        const newUser = new user_1.UserModel({
            provider: 'facebook',
            facebookId: profile.id,
            username: `user${profile.id}`,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos ? profile.photos[0].value : "",
        });
        await newUser.save();
        done(null, newUser);
    }
    catch (err) {
        logging_1.log.error(err);
    }
});
// google strategy
const googleLogin = new passport_google_oauth2_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${serverUrl}${process.env.GOOGLE_CALLBACK_URL}`,
    // passReqToCallback: true,
    // proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
    logging_1.log.info(profile);
    try {
        const oldUser = await user_1.UserModel.findOne({ email: profile.email });
        if (oldUser) {
            return done(null, oldUser);
        }
    }
    catch (err) {
        logging_1.log.error(err);
    }
    try {
        const newUser = await new user_1.UserModel({
            provider: 'google',
            googleId: profile.id,
            username: `user${profile.id}`,
            email: profile.email,
            name: profile.displayName,
            avatar: profile.picture,
        }).save();
        done(null, newUser);
    }
    catch (err) {
        logging_1.log.error(err);
    }
});
passport_1.default.use(localLogin);
passport_1.default.use(jwtLogin);
passport_1.default.use(facebookLogin);
passport_1.default.use(googleLogin);
passport_1.default.use("business-local", businessLocalLogin);
passport_1.default.use("business-jwt", jwtBusinessLogin);
exports.default = passport_1.default;
//# sourceMappingURL=passport.middleware.js.map