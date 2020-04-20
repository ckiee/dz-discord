import { Message, MessageEmbed } from "discord.js";
import {
    command,
    default as CookiecordClient,
    Module,
    CommonInhibitors,
} from "cookiecord";
import IsdPunishment, { IsdPunModel } from "../isdpunishment";
import { collectMessage } from "../util";

export default class IsdPunishmentsModule extends Module {
    constructor(client: CookiecordClient) {
        super(client);
    }

    @command()
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

    @command()
    async lookuppun(msg: Message, name: string) {
        const CODEBLOCK = "```";
        const puns = await IsdPunModel.find({
            violatorName: name.toLowerCase(),
        }).exec();
        if (puns.length == 0) {
            await msg.channel.send(`nothing found on ${name.toLowerCase()}`);
        } else {
            puns.forEach(async (p) => {
                const punisher = isNaN(parseInt(p.punisherID))
                    ? p.punisherID
                    : await msg.guild?.members.fetch(p.punisherID);
                const embed = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(p.violation)
                    .addField("Punishment", p.punishment)
                    .addField("Proof/Witnesses", p.proof)
                    .setFooter(
                        `id is ${p._id} | punished at${
                            !p.createdAt ? " UNKNOWN" : ""
                        }`
                    )
                    .setTimestamp(p.createdAt);
                if (typeof punisher == "string") embed.setAuthor(p.punisherID);
                else if (punisher)
                    embed.setAuthor(
                        punisher.user.tag,
                        punisher.user.displayAvatarURL()
                    );
                msg.channel.send({ embed });
            });
        }
    }

    @command({ inhibitors: [CommonInhibitors.botAdminsOnly] })
    async delallpuns(msg: Message) {
        const res = await IsdPunModel.deleteMany({}).exec();
        msg.channel.send(`deleted ${res.deletedCount} entries`);
    }
    @command()
    async totalpuns(msg: Message) {
        const res = await IsdPunModel.countDocuments({}).exec();
        msg.channel.send(
            `${res} punishment${res !== 1 ? "s" : ""} have been issued.`
        );
    }
    @command({ inhibitors: [CommonInhibitors.botAdminsOnly], single: true })
    async importpuns(msg: Message, json: string) {
        const arr = (JSON.parse(json) as IsdPunishment[]).map((p) => {
            p.createdAt = 0;
            return p;
        });
        const res = await IsdPunModel.create(arr);
        msg.reply(`imported ${res.length} punishments`);
    }
    @command({
        onError: (msg, err) => {
            msg.reply(`:warning: ${err.message}`);
        },
    })
    async deletepun(msg: Message, id: string) {
        const pun = await IsdPunModel.findById(id).exec();
        if (!pun) throw new Error("punishment not found");
        if (pun.punisherID !== msg.author.id)
            throw new Error("you cannot delete punishments that are not yours");
        await IsdPunModel.findByIdAndDelete(id);
        msg.reply("deleted");
    }
}
