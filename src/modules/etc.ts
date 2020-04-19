import { Message } from "discord.js";
import { command, default as CookiecordClient, Module } from "cookiecord";

export default class EtcModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command()
    ping(msg: Message) {
        msg.reply("Pong. :ping_pong:");
    }
    @command()
    async help(msg: Message) {
        const CODEBLOCK = "```";
        let P = this.client.prefix(msg);
        if (P instanceof Promise) P = await P;
        msg.channel.send(`${CODEBLOCK}
${P}totalpuns - how many punishments os far
${P}punish - make new punishment
${P}delall - delete ALL the punishments, muhahuah.
${CODEBLOCK}`);
    }
}
