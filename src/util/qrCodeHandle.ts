import axios from "axios";
import {urlBase} from "../static/staticVar";


export class QrCodeHandle {

    static sendQrCode(qrCode: string) {
        axios.post(`${urlBase}/api/register`, {
            code: qrCode,
            id: process.env.COMPANY || 12
        })
            .then(() => console.log('QRCODE ENVIADO!'))
            .catch(e => console.log(e.message))
    }
}