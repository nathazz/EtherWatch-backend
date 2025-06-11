import mongoose, { Schema, Document, model } from "mongoose";
import { IValidateTransactionResult } from "../interfaces/validates";

export interface ITransaction
  extends Document,
    Partial<IValidateTransactionResult> {
  hash: string;
  from: string;
  to: string;
  value: string;
  valid: boolean;
  confirmed: boolean;
  createdAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    hash: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    value: { type: String, required: true },
    valid: { type: Boolean, required: true },
    confirmed: { type: Boolean, required: true },
  },
  { timestamps: true },
);

export default model<ITransaction>("Transaction", TransactionSchema);
