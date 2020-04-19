import CookiecordClient from "cookiecord";
import dotenv from "dotenv-safe";
import { mongoose } from "@typegoose/typegoose";
dotenv.config();

const client = new CookiecordClient({
    botAdmins: process.env.BOT_ADMINS?.split(","),
    prefix: "d!",
});

client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");
client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
mongoose
    .connect(process.env.MONGO_URL || "mongodb://localhost:27017/", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.DB || "dangerzone-discord",
    })
    .then(() => console.log("Connected to Mongo"));
