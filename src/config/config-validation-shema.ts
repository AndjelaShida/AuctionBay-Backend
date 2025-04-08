// Šema za validaciju vrednosti konfiguracije uz pomoć Joi.
import Joi from "joi";

export const configValidationShema = Joi.object({
    DB_HOST: Joi.string().required(), // DB host mora biti string i ne može biti undefined ili null.
    DB_PORT: Joi.number().default(5432).required(), // DB port mora biti broj, a default je 5432.
    DB_USERNAME: Joi.string().required(), // DB username mora biti string.
    DB_PASSWORD: Joi.string().required(), // DB password mora biti string.
    DB_NAME: Joi.string().required(), // DB name mora biti string.
    JWT_SECRET: Joi.string().required(), // JWT secret mora biti string.
    JWT_SECRET_EXPIRES: Joi.string().required(), // Trajanje JWT tokena u formatu stringa (npr. "3600s").
    JWT_REFRESH_SECRET: Joi.string().required(), // JWT refresh secret mora biti string.
    JWT_REFRESH_SECRET_EXPIRES: Joi.string().required(), // Trajanje JWT refresh tokena u formatu stringa.
    STAGE: Joi.string().valid('development', 'production').required(), // STAGE može biti samo development ili production.
});
