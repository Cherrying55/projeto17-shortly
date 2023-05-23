import joi from "joi";


export const signupmodel = joi.object({
    name: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required(),
    email: joi.string().email().required()
})

export const signinmodel = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})