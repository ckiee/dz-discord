import dotenv from "dotenv-safe";
dotenv.config();
export const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/";
export const db = process.env.DB || "dangerzone-discord";
export const botAdmins = process.env.BOT_ADMINS?.split(",") || [];
export const directors = process.env.DIRECTORS?.split(",") || [];
export const isdChannel = process.env.ISD_CHAN || "719962690319024138";
