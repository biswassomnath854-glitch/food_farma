import { Sequelize } from 'sequelize';
import { env } from './env';
import path from 'path';

const storagePath = path.resolve(__dirname, '../../food_ordering.sqlite');

export const sequelize = env.DB_DIALECT === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      logging: false,
    })
  : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      host: env.DB_HOST,
      port: env.DB_PORT,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully via [${sequelize.getDialect().toUpperCase()}]`);
  } catch (error: any) {
    console.warn(`⚠️ Primary Database Connection (${env.DB_DIALECT}) failed: ${error.message}`);
    if (env.DB_DIALECT !== 'sqlite') {
      console.warn(`👉 Tip: Set DB_DIALECT=sqlite in .env for zero-config local development.`);
    }
    throw error;
  }
};
