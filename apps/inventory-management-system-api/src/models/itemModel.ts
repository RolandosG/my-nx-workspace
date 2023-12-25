import mongoose, { Document, Schema } from 'mongoose';

interface IAttributes {
  attackPower: number;
  fireDamage: number;
  criticalChance: number;
}

interface IMechanics {
  onHit: string;
  onCriticalHit: string;
}

interface IRequirements {
  level: number;
  class: string;
}

export interface IItem extends Document {
  name: string;
  description?: string;
  type: string;
  subType: string;
  rarity: string;
  attributes: IAttributes;
  mechanics: IMechanics;
  durability: number;
  cooldown: number;
  requirements: IRequirements;
  socketSlots: number;
}

const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  subType: { type: String },
  rarity: { type: String },
  attributes: {
    attackPower: { type: Number },
    fireDamage: { type: Number },
    criticalChance: { type: Number }
  },
  mechanics: {
    onHit: { type: String },
    onCriticalHit: { type: String }
  },
  durability: { type: Number },
  cooldown: { type: Number },
  requirements: {
    level: { type: Number },
    class: { type: String }
  },
  socketSlots: { type: Number }
});

export default mongoose.model<IItem>('Item', ItemSchema);
