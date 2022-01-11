import {WhatsConnection} from "./whatsConnection";
import {MessageType, Mimetype, proto} from "@adiwajshing/baileys";
import {MessageApi} from "../model/messageApi";
import {messageAnalisator} from "../util/messageHandle";
import ButtonsMessage = proto.ButtonsMessage;
import {mediaFolder} from "../static/staticVar";
import {MediaMessage} from "../model/mediaMessage";
import {MediaMessageType} from "../model/mediaMessageType";


const conn = WhatsConnection.connection

export function sendTxt(message: MessageApi) {
    conn.prepareMessage(message.remoteJid, message.message, MessageType.text).then((messageBuilted) => {
        messageAnalisator(messageBuilted, conn)
        conn.sendMessage (message.remoteJid, message.message, MessageType.text, {
            messageId: messageBuilted.key.id!!,
        })
            .then(() => console.log(messageBuilted.key))
            .catch(error => {
                console.log('POSSIVEL MSG ENVIADA QUANDO CELULAR TAVA OFF? - ' + error +' - '+ message.message)
            })
    })
}

export function sendButtonsMessage(message: MessageApi) {
    // send a buttons message!
    const buttons = [
        {buttonId: '3', buttonText: {displayText: '😃'}, type: 1},
        {buttonId: '2', buttonText: {displayText: '😐'}, type: 1},
        {buttonId: '1', buttonText: {displayText: '😩'}, type: 1}
    ]
    const buttonMessage = new ButtonsMessage({
        contentText: message.btnText,
        footerText: message.btnFooterText,
        buttons: buttons,
        headerType: 1
    })
    conn.sendMessage (message.remoteJid, buttonMessage, MessageType.buttonsMessage)
        .then((messageBuilded) => console.log(messageBuilded.key))
        .catch(error => console.log(error))
}

export function sendMediaMessage(fileUpload: MediaMessage) {
    const messageDetail = messageDetails(fileUpload)
    const messageOptions = {
        caption: fileUpload.caption,
        mimetype: messageDetail.mimeType,
        ptt: fileUpload.ptt,
        filename: fileUpload.filePath
    }
    conn.prepareMessage(fileUpload.remoteJid, { url: `${mediaFolder}/outbox/${fileUpload.filePath}` }, messageDetail.messageType, messageOptions)
        .then(messageBuilded => {
            console.log(messageBuilded)
            messageAnalisator(messageBuilded, conn)
                .then(() => {
                    conn.sendMessage (fileUpload.remoteJid, { url: `${mediaFolder}/outbox/${fileUpload.filePath}` }, messageDetail.messageType, {
                        caption: messageOptions.caption,
                        mimetype: messageOptions.mimetype,
                        ptt: messageOptions.ptt,
                        filename: messageOptions.filename,
                        messageId: messageBuilded.key.id!!,
                    })
                        .then((returnedMessage) => console.log(returnedMessage.key))
                        .catch(error => console.log(error))
                })
        }).catch(error => console.log(error))
}

function messageDetails(fileUpload: MediaMessage): MediaMessageType {
    switch (fileUpload.fileType) {
        case 'IMAGE':
            return  imageMimeType(fileUpload.filePath)
        case 'DOCUMENT':
            return { messageType: MessageType.document, mimeType: Mimetype.pdf}
        case 'VIDEO':
            return { messageType: MessageType.video, mimeType: Mimetype.mp4}
        case 'AUDIO':
            return audioMimeType(fileUpload)
        default:
            return { messageType: MessageType.text, mimeType: Mimetype.pdf}
    }
}

function audioMimeType(fileUpload: MediaMessage) {
    if(fileUpload.ptt){
        return {
            messageType: MessageType.audio,
            mimeType: Mimetype.ogg
        }
    }
    return {
        messageType: MessageType.audio,
        mimeType: Mimetype.mp4Audio
    }
}

function imageMimeType(name: string) {
    if(name.substring(name.lastIndexOf('.')) === '.png'){
        return {
            messageType: MessageType.image,
            mimeType: Mimetype.png
        }
    }
    return {
        messageType: MessageType.image,
        mimeType: Mimetype.jpeg
    }
}