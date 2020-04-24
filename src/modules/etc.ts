import { Message } from "discord.js";
import {
	command,
	default as CookiecordClient,
	Module,
	listener,
} from "cookiecord";
import { inspect } from "util";

export default class EtcModule extends Module {
	constructor(client: CookiecordClient) {
		super(client);
	}

	@command()
	ping(msg: Message) {
		msg.channel.send("Pong. :ping_pong:");
	}

	@listener({ event: "ready" })
	ready() {
		this.client.user?.setPresence({ activity: { name: "d!help" } });
	}
	// @command({ single: true })
	// async eval(msg: Message, js: string) {
	// 	if (msg.author.id !== "142244934139904000") throw new Error("not ron");
	// 	console.log("EVAL", js);
	// 	try {
	// 		let result = eval(js);
	// 		if (result instanceof Promise) result = await result;
	// 		if (typeof result != `string`) result = inspect(result);
	// 		if (result.length > 1990)
	// 			return await msg.channel.send(
	// 				`Message is over the discord message limit.`
	// 			);
	// 		await msg.channel.send(
	// 			"```js\n" +
	// 				result.split(this.client.token).join("[TOKEN]") +
	// 				"\n```"
	// 		);
	// 	} catch (error) {
	// 		msg.reply(
	// 			"error! " +
	// 				(error || "")
	// 					.toString()
	// 					.split(this.client.token)
	// 					.join("[TOKEN]")
	// 		);
	// 	}
	// }
}
