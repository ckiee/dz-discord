import { getModelForClass, prop } from "@typegoose/typegoose";

export default class IsdPunishment {
    @prop({ required: true })
    public punisherID!: string;
    @prop({ required: true, lowercase: true, trim: true })
    public violatorName!: string;
    @prop({ required: true })
    public violation!: string;
    @prop({ required: true })
    public proof!: string;
    @prop({ required: true })
    public punishment!: string;
    @prop({ required: true })
    public createdAt!: number;
}

export const IsdPunModel = getModelForClass(IsdPunishment);
