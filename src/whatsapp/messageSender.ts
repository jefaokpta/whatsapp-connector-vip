import {WhatsConnection} from "./whatsConnection";
import {MessageType} from "@adiwajshing/baileys";
import {MessageApi} from "../model/messageApi";
import {sendTextMessageAckToApi} from "../util/messageHandle";


const conn = WhatsConnection.connection

export function sendTxt(message: MessageApi) {
    conn.prepareMessage(message.remoteJid, message.message, MessageType.text).then((messageBuilted) => {
        sendTextMessageAckToApi(messageBuilted)
        conn.sendMessage (message.remoteJid, message.message, MessageType.text, {
            messageId: messageBuilted.key.id!!,
        })
            .then(() => console.log(messageBuilted.key))
            .catch(error => {
                console.log('POSSIVEL MSG ENVIADA QUANDO CELULAR TAVA OFF? - ' + error +' - '+ message.message)
            })
    })
}
//
// export function sendButtonsMessage(message) {
//     // send a buttons message!
//     const buttons = [
//         {buttonId: '3', buttonText: {displayText: '😃'}, type: 1},
//         {buttonId: '2', buttonText: {displayText: '😐'}, type: 1},
//         {buttonId: '1', buttonText: {displayText: '😩'}, type: 1}
//     ]
//     const buttonMessage = {
//         contentText: message.btnText,
//         footerText: message.btnFooterText,
//         buttons: buttons,
//         headerType: 1
//     }
//     conn.sendMessage (message.remoteJid, buttonMessage, MessageType.buttonsMessage)
//         .then(() => console.log(message.key))
//         .catch(error => console.log(error))
// }
//
// export function sendMediaMessage(fileUpload) {
//     const messageDetail = messageDetails(fileUpload)
//     const messageOptions = {
//         caption: fileUpload.caption,
//         mimetype: messageDetail.mimeType,
//         ptt: fileUpload.ptt,
//         filename: fileUpload.filePath
//     }
//     //conn.prepareMessage (fileUpload.remoteJid, { url: `${mediaFolder}/outbox/${fileUpload.filePath}` }, messageDetail.messageType, messageOptions)
//     conn.sendMessage (fileUpload.remoteJid, { url: `${mediaFolder}/outbox/${fileUpload.filePath}` }, messageDetail.messageType, messageOptions)
//         .then((returnedMessage) => console.log(returnedMessage.key))
//         .catch(error => console.log(error))
// }
//
// function messageDetails(fileUpload) {
//     switch (fileUpload.fileType) {
//         case 'IMAGE':
//             return  imageMimeType(fileUpload.filePath)
//         case 'DOCUMENT':
//             return { messageType: MessageType.document, mimeType: Mimetype.pdf}
//         case 'VIDEO':
//             return { messageType: MessageType.video, mimeType: Mimetype.mp4}
//         case 'AUDIO':
//             return audioMimeType(fileUpload)
//     }
// }
//
// function audioMimeType(fileUpload) {
//     if(fileUpload.ptt){
//         return {
//             messageType: MessageType.audio,
//             mimeType: Mimetype.ogg
//         }
//     }
//     return {
//         messageType: MessageType.audio,
//         mimeType: Mimetype.mp4Audio
//     }
// }
//
// function imageMimeType(name) {
//     if(name.substring(name.lastIndexOf('.')) === '.png'){
//         return {
//             messageType: MessageType.image,
//             mimeType: Mimetype.png
//         }
//     }
//     return {
//         messageType: MessageType.image,
//         mimeType: Mimetype.jpeg
//     }
// }