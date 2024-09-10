"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const validators_1 = require("../utils/validators");
const user_1 = require("../models/user");
const businessUser_model_1 = require("../models/businessUser.model");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const jwt_1 = require("../utils/jwt");
const logging_1 = require("../utils/logging");
class AuthService {
    constructor() {
        this.requireLocalAuth = (req, res, next) => {
            passport_1.default.authenticate('local', (err, user, info) => {
                // log(err, user)
                if (err) {
                    return next(err);
                }
                // log(info)
                if (!user) {
                    return res.status(422).send(info);
                }
                req.user = user;
                next();
            })(req, res, next);
        };
        this.requireBusinessAuth = (req, res, next) => {
            passport_1.default.authenticate('business-local', (err, user, info) => {
                // log(err, user)
                if (err) {
                    return next(err);
                }
                // log(info)
                if (!user) {
                    return res.status(422).send(info);
                }
                req.user = user;
                next();
            })(req, res, next);
        };
        this.afterLocalLogin = (req, res) => {
            try {
                const token = (0, jwt_1.generateJWT)(req.user);
                const me = req.user;
                res.json({ token, me });
            }
            catch (err) {
                throw new HttpException_1.default(401, "Authentication Failed");
            }
        };
        this.afterBusinessLogin = (req, res) => {
            try {
                const token = (0, jwt_1.generateBusinessJWT)(req.user);
                const me = req.user;
                res.json({ data: { token, me }, message: "OK" });
            }
            catch (err) {
                res.status(401).json({ error: "Authentication Failed" });
            }
        };
        this.after3rdLogin = (req, res) => {
            try {
                logging_1.log.info("After 3rd login");
                const token = (0, jwt_1.generateJWT)(req.user);
                res.header('Authentication', "Bearer " + token);
                // res.cookie('x-auth-cookie', token);
                // res.redirect('/'); // todo: verify this
                res.send({
                    token,
                    "me": req.user
                });
            }
            catch (err) {
                throw new HttpException_1.default(401, "Authentication Failed");
            }
        };
        this.localRegister = async (req, res, next) => {
            const { error } = validators_1.registerSchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message });
            }
            const { email, password, name, username } = req.body;
            try {
                const existingUser = await user_1.UserModel.findOne({ email });
                if (existingUser) {
                    return res.status(422).send({ message: 'Email is in use' });
                }
                try {
                    const newUser = new user_1.UserModel({
                        provider: 'email',
                        email,
                        password,
                        username,
                        name,
                        avatar: "", // todo: add default
                    });
                    newUser.registerUser(newUser, (user) => {
                        if (!user)
                            throw new HttpException_1.default(500, "Register failed.");
                        res.json({ message: 'Register success.' }); // just redirect to login
                    });
                }
                catch (err) {
                    return next(err);
                }
            }
            catch (err) {
                return next(err);
            }
        };
        this.addBusinessUser = async (req, res, next) => {
            const { error } = validators_1.businessRegisterSchema.validate(req.body);
            if (error) {
                return res.status(442).send({ message: error.details[0].message });
            }
            const { identifier, password, description } = req.body;
            try {
                const existingUser = await businessUser_model_1.BUserModel.findOne({ identifier });
                if (existingUser) {
                    return res.status(422).send({ message: `Identifier [${identifier}] is in use` });
                }
                try {
                    const newUser = new businessUser_model_1.BUserModel({
                        identifier,
                        password,
                        description,
                        iPWhiteList: ["::1", "::ffff:127.0.0.1"], // localhost must be able to access
                    });
                    newUser.createBUser(newUser);
                    res.json({ message: 'Register success.', data: newUser.toAdminJSON() });
                }
                catch (err) {
                    return next(err);
                }
            }
            catch (err) {
                return next(err);
            }
        };
        this.logout = (req, res) => {
            req.logout((err) => { });
            res.send(false);
        };
        this.requireAuth = (req, res, next) => {
            // corresponding with the {jwtLogin} strategy
            // The way to provide this auth is to have a
            // Bearer token in the Authorization header
            passport_1.default.authenticate("jwt", (err, user) => {
                // log("Authenticating with jwt...")
                if (err) {
                    // log(err)
                    return res.status(401).json({ error: 'unauthorized', message: err.message });
                }
                if (!user) {
                    return res.status(401).json({ error: 'unauthorized', message: 'Need to set Authorization Header' });
                }
                else {
                    return next();
                }
            })(req, res, next);
        };
        this.requireBusinessJwtAuth = (req, res, next) => {
            passport_1.default.authenticate("business-jwt", (err, user) => {
                // log("Authenticating with jwt...")
                if (err) {
                    // log(err)
                    return res.status(401).json({ error: 'unauthorized', message: err.message });
                }
                if (!user) {
                    return res.status(401).json({ error: 'unauthorized', message: 'Need to set Authorization Header' });
                }
                else {
                    return next();
                }
            })(req, res, next);
        };
        this.requireBusinessAdmin = (req, res, next) => {
            if (req.user && req.user.identifier === "admin") {
                // user is admin payload
                next();
            }
            else {
                res.status(401).json({ error: 'unauthorized', message: 'Not Admin' });
            }
        };
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map