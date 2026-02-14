import { Sequelize } from "sequelize";

import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export const sequelize = new Sequelize(env.AUTH_DB_URL, {
  dialect: "mysql",
  logging:
    env.NODE_ENV === "development"
      ? (message: unknown) => {
          logger.debug({ sequlieze: message });
        }
      : false,

  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export const connectToDatabase = async () => {
  await sequelize.authenticate();
  logger.info("Auth database connection established successfully");
};

export const closeDatabase = async () => {
  await sequelize.close();

  logger.info("Database for auth service will be closed connection");
};
