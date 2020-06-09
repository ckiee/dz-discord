import { Message } from "discord.js";
import { isdChannel } from "./env";

export async function collectMessage(msg: Message) {
	const res = (
		await msg.channel.awaitMessages(
			(nm) => nm.author.id !== msg.client.user?.id,
			{
				max: 1,
				time: 1000 * 60 * 2,
				errors: ["time"],
			}
		)
	).first();
	if (!res) throw new Error("couldnt collect message");
	return res;
}
export async function inIsdChan(msg: Message) {
	if (msg.channel.id !== isdChannel)
		return `can only run this in <#${isdChannel}>`;
}
