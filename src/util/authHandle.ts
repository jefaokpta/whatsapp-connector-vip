import axios from "axios";
import {AuthInfo} from "../model/AuthInfo";
import {urlBase} from "../static/staticVar";

    export function authConfirmed(authInfo: AuthInfo){
        authInfo.companyId = process.env.COMPANY || '12';
        console.log(authInfo)
        axios.post(`${urlBase}/api/register/auth`, authInfo)
            .then(() => console.log('QRCODE SALVO NO BANCO!'))
            .catch(e => console.log(e.message))
    }

    export function restoreAuth(){
        return axios.get(`${urlBase}/api/register/auth/${process.env.COMPANY || 12}`)
    }