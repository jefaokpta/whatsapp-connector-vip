import {proto, WAConnection} from "@adiwajshing/baileys";
import WebMessageInfo = proto.WebMessageInfo;
import axios from "axios";
import {mediaFolder, urlBase} from "../static/staticVar";
import {MessageData} from "../model/messageData";
import * as fs from "fs";

export async function messageAnalisator(message: WebMessageInfo, conn: WAConnection) {
    let messageData = new MessageData(
        message.key,
        null,
        message.messageTimestamp,
        message.status,
        process.env.COMPANY || "12",
        process.env.API_PORT || "3001",
        false
    )

    if(message.message?.audioMessage){
        messageData = await audioMessage(messageData, message, conn);
    }else if(message.message?.documentMessage){
        messageData = await documentMessage(messageData, conn, message);
    }else if(message.message?.videoMessage){
        //TODO: videoMessage
    }else if(message.message?.imageMessage){
//TODO: imageMessage
    }else if(message.message?.buttonsMessage){
//todo: buttonsMessage
    }else if(message.message?.buttonsResponseMessage){
//todo: buttonsResponseMessage
    }else if(message.message?.contactMessage){
//todo: contactMessage
    }else if(message.message?.contactsArrayMessage){
//todo: contactsArrayMessage
    }else{ // textMessage e qlqr outro tipo de mensagem
        messageData.message = message.message
    }
    return axios.post(`${urlBase}/api/messages`, messageData)
}

export function sendTextMessageAckToApi(message: WebMessageInfo) {
    const messageData = new MessageData(
        message.key,
        message.message,
        message.messageTimestamp,
        message.status,
        process.env.COMPANY || "12",
        process.env.API_PORT || "3001",
        false
    )
    axios.post(`${urlBase}/api/messages`, messageData)
        .then(response => {
            console.log(`ACK Text: ${response.status} - ${message.message}`)
        })
}

function downloadAndSaveMedia(message: WebMessageInfo, mediaTitle: string, conn: WAConnection){
    const fileName = `${mediaTitle}-${message.messageTimestamp}-${message.key.id}`
    return conn.downloadAndSaveMediaMessage (message, `${mediaFolder}/${fileName}`) // to decrypt & save to file
    //console.log(message.key.remoteJid + " MEDIA SALVA EM: " + savedFilename)
}

async function audioMessage(messageData: MessageData, message: WebMessageInfo, conn: WAConnection){
    messageData.mediaMessage = true
    messageData.mediaType = 'AUDIO'
    messageData.mediaUrl = await downloadAndSaveMedia(message, 'audio', conn)
    return messageData
}

async function documentMessage(messageData: MessageData, conn: WAConnection, message: WebMessageInfo) {
    messageData.mediaMessage = true
    messageData.mediaType = 'DOCUMENT'
    const buffer = await conn.downloadMediaMessage(message)
    const fileTitle = message.message!!.documentMessage!!.fileName
    const fileExtension = fileTitle!!.substring(fileTitle!!.lastIndexOf('.'))
    const fileName = `document-${message.messageTimestamp}-${message.key.id}${fileExtension}`
    messageData.mediaUrl = fileName
    messageData.mediaFileLength = message.message?.documentMessage?.fileLength
    messageData.mediaPageCount = message.message?.documentMessage?.pageCount
    messageData.mediaFileTitle = fileTitle
    fs.writeFile(`${mediaFolder}/${fileName}`, buffer, error => {
        if (error) {
            console.log(error)
        } else console.log('DOCUMENTO SALVO COM SUCESSO!')
    })
    return messageData
}