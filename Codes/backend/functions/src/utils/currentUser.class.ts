import { firebaseUidToUuid } from "./firebaseUidToUuid"

export class CurrentUser {
    public static uuid :string 
    public static setUuid(uid:string) {
        this.uuid = firebaseUidToUuid(uid)
    }
}