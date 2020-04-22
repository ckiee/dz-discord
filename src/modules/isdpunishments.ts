import { Message, MessageEmbed, User } from "discord.js";
import {
	command,
	default as CookiecordClient,
	Module,
	CommonInhibitors,
	optional,
} from "cookiecord";
import IsdPunishment, { IsdPunModel } from "../isdpunishment";
import { collectMessage, inIsdChat } from "../util";
import { DocumentType } from "@typegoose/typegoose";

export default class IsdPunishmentsModule extends Module {
	constructor(client: CookiecordClient) {
		super(client);
	}
	async getPunishmentEmbed(p: DocumentType<IsdPunishment>) {
		const punisher = isNaN(parseInt(p.punisherID))
			? p.punisherID
			: await this.client.users.fetch(p.punisherID);
		const embed = new MessageEmbed()
			.setColor("RED")
			.setDescription(p.violation)
			.addField("Punishment", p.punishment)
			.addField("Proof/Witnesses", p.proof)
			.setTitle(p.violatorName)
			.setFooter(
				`id is ${p._id} | punished at${!p.createdAt ? " UNKNOWN" : ""}`
			)
			.setTimestamp(p.createdAt);
		if (typeof punisher == "string") embed.setAuthor(p.punisherID);
		else if (punisher)
			embed.setAuthor(punisher.tag, punisher.displayAvatarURL());
		return embed;
	}

	@command({ inhibitors: [inIsdChat] })
	async punish(msg: Message) {
		msg.channel.send(
			"IGN of bad player? (2 minutes to reply, case insensitive)"
		);
		const violatorName = await (
			await collectMessage(msg)
		).content.toLowerCase();
		msg.channel.send(`What did ${violatorName} do?`);
		const violation = await (await collectMessage(msg)).content;
		msg.channel.send(`Proof/Witnesses?`);
		const proof = await (await collectMessage(msg)).content;
		msg.channel.send(`What is ${violatorName}'s punishment?`);
		const punishment = await (await collectMessage(msg)).content;

		const pun = await IsdPunModel.create({
			proof,
			punisherID: msg.author.id,
			punishment,
			violation,
			violatorName,
			createdAt: Date.now(),
		} as IsdPunishment);
		msg.channel.send(`Made new punishment. (id is ${pun._id})`);
		console.log(pun);
	}
	@command({ inhibitors: [inIsdChat] })
	async lookupPunBy(msg: Message, @optional u: User) {
		const puns = await IsdPunModel.find({
			punisherID: u.id || msg.author.id,
		}).exec();
		if (puns.length == 0) {
			await msg.channel.send(
				`${u.tag || msg.author.tag} hasnt issued any punishments`
			);
		} else {
			puns.forEach(async (p) => {
				msg.channel.send({ embed: await this.getPunishmentEmbed(p) });
			});
		}
	}
	@command({ inhibitors: [inIsdChat] })
	async lookupPun(msg: Message, name: string) {
		const puns = await IsdPunModel.find({
			violatorName: name.toLowerCase(),
		}).exec();
		if (puns.length == 0) {
			await msg.channel.send(`nothing found on ${name.toLowerCase()}`);
		} else {
			puns.forEach(async (p) => {
				msg.channel.send({ embed: await this.getPunishmentEmbed(p) });
			});
		}
	}

	@command({
		inhibitors: [CommonInhibitors.botAdminsOnly],
		onError: (msg, err) => {
			msg.channel.send(`:warning: ${err.message}`);
		},
	})
	async delallpuns(msg: Message) {
		const VERIFY_STR =
			"YESIMREALLYFUCKINGSUREIWANNADELETEEVERYTHINGIMTOTALLYCRAZY";
		msg.channel.send(
			":warning: This is a terrible idea but if you're sure respond with: " +
				VERIFY_STR
		);

		const confirm = await (await collectMessage(msg)).content;
		if (confirm.trim() !== VERIFY_STR)
			throw new Error("you need to type the thing i said you moron");
		const res = await IsdPunModel.deleteMany({}).exec();
		msg.channel.send(`deleted ${res.deletedCount} entries`);
	}
	@command({ inhibitors: [inIsdChat] })
	async totalpuns(msg: Message) {
		const res = await IsdPunModel.countDocuments({}).exec();
		msg.channel.send(
			`${res} punishment${res !== 1 ? "s" : ""} have been issued.`
		);
	}
	@command({
		inhibitors: [CommonInhibitors.botAdminsOnly],
		single: true,
	})
	async importpuns(msg: Message, json: string) {
		const arr = (JSON.parse(json) as IsdPunishment[]).map((p) => {
			p.createdAt = 0;
			return p;
		});
		const res = await IsdPunModel.create(arr);
		msg.channel.send(`imported ${res.length} punishments`);
	}
	@command({
		onError: (msg, err) => {
			msg.channel.send(`:warning: ${err.message}`);
		},
		inhibitors: [inIsdChat],
	})
	async deletepun(msg: Message, id: string) {
		const pun = await IsdPunModel.findById(id).exec();
		if (!pun) throw new Error("punishment not found");
		if (pun.punisherID !== msg.author.id) {
			if (this.client.botAdmins.includes(msg.author.id)) {
				msg.channel.send(
					"you are a bot admin, you may respond with BYPASS to delete the report even though its not yours"
				);
				const confirm = await (await collectMessage(msg)).content;
				if (confirm == "BYPASS") {
					await IsdPunModel.findByIdAndDelete(id);
					msg.channel.send("deleted (bypass)");
					return;
				} else {
					throw new Error(
						"you didnt delete a punishment that isnt yours"
					);
				}
			} else {
				throw new Error(
					"you cannot delete punishments that are not yours"
				);
			}
		}
		await IsdPunModel.findByIdAndDelete(id);
		msg.channel.send("deleted");
	}
}
