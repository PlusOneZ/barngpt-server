import { Logger } from "tslog";

export const dbLog: Logger = new Logger({ name: "Database" });
export const log: Logger = new Logger({ name: "Server" });
