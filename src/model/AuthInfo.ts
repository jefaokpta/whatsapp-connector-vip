
export interface AuthInfo{
    clientID: string;
    serverToken: string;
    clientToken: string;
    encKey: string;
    macKey: string;
    companyId?: string;
}