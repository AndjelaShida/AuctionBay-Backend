// Šema za validaciju vrednosti konfiguracije uz pomoć Joi.

import Joi from "joi";

export const configValidationShema = Joi.object({ //Ova linija definira promenljivu configValidationSchema, koja sadrži Joi šemu. Joi.object() označava da ćeš definisati šemu za objekat. U ovom slučaju, objekat predstavlja konfiguracione vrednosti koje očekujemo u .env fajlu.
    DB_HOST: Joi.string().required(), //Joi.string(): Očekuje da vrednost za DB_HOST bude string. required(): Ova metoda označava da vrednost za DB_HOST mora biti prisutna i ne može biti undefined ni null.
    DB_PORT : Joi.number().default('5432').required(),
    DB_USERNAME : Joi.string().required(),
    DB_PASSWORD : Joi.string().required(),
    DB_NAME : Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_SECRET_EXPIRES: Joi.number().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET_EXPIRES: Joi.number().required(),
    STAGE: Joi.string().valid('development', 'production').required(), // STAGE za upravljanje okruzenjima
});
