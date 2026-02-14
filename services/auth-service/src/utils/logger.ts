import { createLogger } from "@chat-youapp/common";
import type { Logger } from "@chat-youapp/common";

export const logger: Logger = createLogger({ name: "auth-service" });
