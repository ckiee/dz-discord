import { Message } from "discord.js";
import {
    command,
    default as CookiecordClient,
    Module,
    listener,
} from "cookiecord";

export default class EtcModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command()
    ping(msg: Message) {
        msg.reply("Pong. :ping_pong:");
    }

    @listener({ event: "ready" })
    ready() {
        this.client.user?.setPresence({ activity: { name: "d!help" } });
    }
}
