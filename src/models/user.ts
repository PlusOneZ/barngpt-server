import { Schema, InferSchemaType, model, Model } from "mongoose";
import { randomUUID } from "crypto"
import bcrypt from 'bcryptjs'
import Joi from 'joi'

interface IUser {
    provider: string,
    username: string,
    email: string,
    password: string,
    name: string,
    avatar: string,
    bio: string,
    googleId: string,
    facebookId: string
}

interface IUserMethods {
    registerUser(user: any, cb: any): void,
    comparePassword(pwd: string, cb: any): void
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
    name: Schema.Types.String,
    avatar: Schema.Types.String,
    bio: Schema.Types.String,
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

userSchema.method("registerUser",  (newUser, callback: any) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, async (errh, hash) => {
            if (err || errh) {
                console.log(err, errh)
            }
            newUser.password = hash;
            await newUser.save().then(callback)
        })
    })
});

userSchema.method("comparePassword", function (candidatePassword: string, callback: any) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
});

async function hashPassword(password: string) {
    const saltRounds = 10;

    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err);
            else resolve(hash);
        });
    });

    return hashedPassword;
}

const validateUser = (user: IUser) => {
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

const UserModel = model<IUser, UserModel>('User', userSchema)

export {
    UserModel,
    IUser,
    validateUser,
    hashPassword
}