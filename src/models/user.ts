import { Schema, InferSchemaType, model } from "mongoose";
import { randomUUID } from "crypto"
import jwt from "jsonwebtoken"
import bcrypt from 'bcryptjs'
import Joi from 'joi'

const userSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: () => randomUUID()
    },
    provider: {
        type: Schema.Types.String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9_]+$/, 'is invalid'],
        index: true,
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        maxlength: 60,
    },
    name: String,
    avatar: String,
    bio: String,
    // google
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // fb
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // todo: link to tasks
}, { timestamps: true })

type User = InferSchemaType<typeof userSchema>;

userSchema.methods.toJSON = function () {
    return {
        id: this._id,
        provider: this.provider,
        email: this.email,
        username: this.username,
        avatar: this.avatar,
        name: this.name,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

const secretOrKey = process.env.JWT_SECRET

userSchema.methods.generateJWT = function () {
    const token = jwt.sign({
        expiresIn: '12h',
        id: this._id,
        provider: this.provider,
        email: this.email,
    }, secretOrKey);
    return token;
}

userSchema.methods.registerUser = (newUser, callback: any) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (errh, hash) => {
            if (err || errh) {
                console.log(err, errh)
            }
            newUser.password = hash;
            newUser.save(callback)
        })
    })
}

userSchema.methods.comparePassword = function (candidatePassword, callback: any) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

async function hashPassword(password) {
    const saltRounds = 10;

    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err);
            else resolve(hash);
        });
    });

    return hashedPassword;
}

const validateUser = (user) => {
    const schema = Joi.object({
        avatar: Joi.any(),
        name: Joi.string().min(2).max(30).required(),
        username: Joi.string()
            .min(2)
            .max(20)
            .regex(/^[a-zA-Z0-9_]+$/)
            .required(),
        password: Joi.string().min(6).max(20).allow('').allow(null),
    });

    return schema.validate(user);
};

const UserModel = model('User', userSchema)

export {
    UserModel,
    User,
    validateUser,
    hashPassword
}