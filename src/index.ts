import CookiecordClient, { HelpModule } from "cookiecord";
import { botAdmins, db, mongoURL } from "./env";
import { mongoose } from "@typegoose/typegoose";
console.log({ botAdmins });
const client = new CookiecordClient({
    botAdmins: botAdmins,
    prefix: "d!",
});

client.registerModule(HelpModule);
client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");
client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: db,
    })
    .then(() => console.log("Connected to Mongo"));
