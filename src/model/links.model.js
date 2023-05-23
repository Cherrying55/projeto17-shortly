import joi from "joi";

export const postshortenmodel = joi.object({
    url: joi.string().domain()
})