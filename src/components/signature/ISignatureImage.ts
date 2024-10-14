import { SignatureType } from "./SignatureType";

export interface ISignatureImage {
    width: number;
    height: number;
    type: SignatureType;
    dataURL: string;
}