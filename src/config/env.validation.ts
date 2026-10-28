import Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public',
  ),
  JWT_SECRET: Joi.string().default(
    'super-secret-helpdesk-key-for-dev-change-in-prod',
  ),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
});
