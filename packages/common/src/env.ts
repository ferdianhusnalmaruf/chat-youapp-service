import { ZodObject, ZodRawShape } from 'zod';

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serviceName?: string;
}

type SchemaOutput<TSchema extends ZodRawShape> = ZodObject<TSchema>['_output'];

export const createEnv = <TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>,
  options: EnvOptions = {},
): SchemaOutput<TSchema> => {
  console.log(`process env: ${String(process.env)}`);
  const { source = process.env, serviceName = 'service' } = options;

  const parsed = schema.safeParse(source);

  console.log(`parsed: ${String(parsed)} && data ${parsed.data}`);

  if (!parsed.success) {
    const formatedErrors = parsed.error.format();
    throw new Error(
      `[${serviceName}] env variable failed validation ${JSON.stringify(formatedErrors)}`,
    );
  }

  return parsed.data;
};

export type EnvSchema<TShape extends ZodRawShape> = ZodObject<TShape>['_output'];
