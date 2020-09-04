import { DocumentType } from "@typegoose/typegoose";
import {
	command,
	CommonInhibitors,
	default as CookiecordClient,
	Module,
	optional,
} from "cookiecord";
import { Message, MessageEmbed, GuildMember } from "discord.js";
import IsdPunishment, { IsdPunModel } from "../isdpunishment";
import { collectMessage, inIsdChan, isDirector } from "../util";

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

	@command({ inhibitors: [inIsdChan] })
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
	@command({ inhibitors: [inIsdChan], aliases: ["lookupby"] })
	async lookupPunBy(msg: Message, @optional { user }: GuildMember) {
		const puns = await IsdPunModel.find({
			punisherID: user.id || msg.author.id,
		})
			.sort({ createdAt: -1 })
			.limit(5)
			.exec();
		if (puns.length == 0) {
			await msg.channel.send(
				`${user.tag || msg.author.tag} hasnt issued any punishments.`
			);
		} else {
			puns.forEach(async p => {
				msg.channel.send({
					embed: await this.getPunishmentEmbed(p),
				});
			});
		}
	}
	@command({ inhibitors: [inIsdChan], aliases: ["lookup"] })
	async lookupPun(msg: Message, name: string) {
		const puns = await IsdPunModel.find({
			violatorName: name.toLowerCase(),
		}).exec();
		if (puns.length == 0) {
			await msg.channel.send(
				`nothing found on \`${name.toLowerCase()}\`.`
			);
		} else {
			puns.forEach(async p => {
				msg.channel.send({
					embed: await this.getPunishmentEmbed(p),
				});
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
			":warning: This is a terrible idea but if you're sure respond with: `" +
				VERIFY_STR +
				"`."
		);

		const confirm = await (await collectMessage(msg)).content;
		if (confirm.trim() !== VERIFY_STR)
			throw new Error("you need to type the thing i said you moron.");
		const res = await IsdPunModel.deleteMany({}).exec();
		msg.channel.send(`deleted ${res.deletedCount} entries`);
	}
	@command({ inhibitors: [inIsdChan] })
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
		const arr = (JSON.parse(json) as IsdPunishment[]).map(p => {
			p.createdAt = 0;
			return p;
		});
		const res = await IsdPunModel.create(arr);
		msg.channel.send(`imported ${res.length} punishments.`);
	}
	@command({
		onError: (msg, err) => {
			msg.channel.send(`:warning: ${err.message}`);
		},
		inhibitors: [inIsdChan],
	})
	async deletepun(msg: Message, id: string) {
		const pun = await IsdPunModel.findById(id).exec();
		if (!pun) throw new Error("punishment not found!");
		if (pun.punisherID !== msg.author.id) {
			throw new Error(
				"you cannot delete punishments that are not yours."
			);
		}
		await IsdPunModel.findByIdAndDelete(id);
		msg.channel.send("deleted.");
	}
	@command({
		onError: (msg, err) => {
			msg.channel.send(`:warning: ${err.message}`);
		},
		inhibitors: [inIsdChan, isDirector],
		aliases: ["deletepuna"],
	})
	async deletepunadmin(msg: Message, id: string) {
		if (id == "5f522567317602001b6e9e9a")
			throw new Error("punishment too strong!");
		const pun = await IsdPunModel.findById(id).exec();
		if (!pun) throw new Error("punishment not found!");
		await IsdPunModel.findByIdAndDelete(id);
		msg.channel.send("deleted. (admin)");
	}
}
