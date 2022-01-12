import {proto, WAConnection} from "@adiwajshing/baileys";
import WebMessageInfo = proto.WebMessageInfo;
import axios from "axios";
import {mediaFolder, urlBase} from "../static/staticVar";
import {MessageData} from "../model/messageData";
import * as fs from "fs";

export async function messageAnalisator(message: WebMessageInfo, conn: WAConnection) {
    const messageData = new MessageData(
        message.key,
        null,
        message.messageTimestamp,
        message.status,
        process.env.COMPANY || "12",
        process.env.API_PORT || "3001",
        false
    )

    if(message.message?.audioMessage){
        await audioMessage(messageData, message, conn);
    }else if(message.message?.documentMessage){
        await documentMessage(messageData, conn, message);
    }else if(message.message?.videoMessage){
        await videoMessage(messageData, message, conn);
    }else if(message.message?.imageMessage){
        await imageMessage(messageData, message, conn);
    }else if(message.message?.buttonsMessage){
        console.log('::::::::: BOTAO PERGUNTA')
        console.log(message)
        return
    }else if(message.message?.buttonsResponseMessage){
        console.log(';;;;;;;;;;;; BOTAO RESPOSTA')
        console.log(message)
        messageData.message = message.message
        return axios.post(`${urlBase}/api/messages/responses`, messageData)
    }else if(message.message?.contactMessage){
        console.log(';;;;;;;;;;;;; RECEBIDO CONTATO')
        const vcardCuted = message.message.contactMessage.vcard!!.split('waid=')[1];
        messageData.message = {
            conversation: `${message.message.contactMessage.displayName}: ${vcardCuted.split(':')[0]}`
        }
    }else if(message.message?.contactsArrayMessage){
        console.log(';;;;;;;;;;;;; RECEBIDO ARRAY CONTATOS')
        messageData.message = {conversation: ''}
        message.message.contactsArrayMessage.contacts!!.forEach(contact => {
            const vcardCuted = contact.vcard!!.split('waid=')[1];
            messageData.message!!.conversation += `${contact.displayName}: ${vcardCuted.split(':')[0]} \n`
        })
        console.log(messageData.message)
    }else{ // TEXT MESSAGE OR OTHER UNKNOWN MESSAGE YET
        messageData.message = message.message
    }
    return axios.post(`${urlBase}/api/messages`, messageData)
}

function downloadAndSaveMedia(message: WebMessageInfo, mediaTitle: string, conn: WAConnection){
    console.log(`Downloading media: ${mediaTitle}`)
    const fileName = `${mediaTitle}-${message.key.id}`
    return conn.downloadAndSaveMediaMessage (message, `${mediaFolder}/${fileName}`) // to decrypt & save to file
}

async function audioMessage(messageData: MessageData, message: WebMessageInfo, conn: WAConnection){
    messageData.mediaMessage = true
    messageData.mediaType = 'AUDIO'
    console.log(message.message?.audioMessage?.mimetype)
    const mimeTypeMedia = defineMimeTypeAudioMedia(message);
    const filePath  = `${mediaFolder}/audio-${message.key.id}.${mimeTypeMedia}`
    if(fs.existsSync(filePath)){
        console.log(`AUDIO JA EXISTE ${filePath}`)
        messageData.mediaUrl = filePath
    } else {
        messageData.mediaUrl = await downloadAndSaveMedia(message, 'audio', conn)
    }
}

function defineMimeTypeAudioMedia(message: WebMessageInfo){
    if(message.message?.audioMessage?.mimetype?.includes('ogg')){
        return 'ogg'
    } else if(message.message?.audioMessage?.mimetype?.includes('mp4')){
        return 'mp4'
    } else{
        return 'mpeg'
    }
}

async function documentMessage(messageData: MessageData, conn: WAConnection, message: WebMessageInfo) {
    messageData.mediaMessage = true
    messageData.mediaType = 'DOCUMENT'
    const fileTitle = message.message!!.documentMessage!!.fileName
    const fileExtension = fileTitle!!.substring(fileTitle!!.lastIndexOf('.'))
    const filePath = `${mediaFolder}/document-${message.key.id}${fileExtension}`
    if(fs.existsSync(filePath)){
        console.log(`DOCUMENTO JA EXISTE ${filePath}`)
    } else {
        const buffer = await conn.downloadMediaMessage(message)
        console.log(`Downloading media: ${fileTitle}`)
        try{
            fs.writeFileSync(filePath, buffer)
        }catch (e) {
            console.log('ERRO AO SALVAR DOCUMENTO')
            console.log(e)
        }
        console.log(`Documento salvo em: ${filePath}`)
    }
    messageData.mediaUrl = filePath
    messageData.mediaFileLength = message.message?.documentMessage?.fileLength
    messageData.mediaPageCount = message.message?.documentMessage?.pageCount
    messageData.mediaFileTitle = fileTitle
}

async function videoMessage(messageData: MessageData, message: WebMessageInfo, conn: WAConnection){
    messageData.mediaMessage = true
    messageData.mediaType = 'VIDEO'
    const filePath  = `${mediaFolder}/video-${message.key.id}.mp4`
    if(fs.existsSync(filePath)){
        console.log(`VIDEO JA EXISTE ${filePath}`)
        messageData.mediaUrl = filePath
    } else {
    messageData.mediaUrl = await downloadAndSaveMedia(message, 'video', conn)
    }
    if (message.message?.videoMessage?.caption) {
        messageData.mediaCaption = message.message.videoMessage.caption
    }
}

async function imageMessage(messageData: MessageData, message: WebMessageInfo, conn: WAConnection){
    messageData.mediaMessage = true
    messageData.mediaType = 'IMAGE'
    const mimeTypeMedia = message.message?.imageMessage?.mimetype?.split('/')[1]
    const filePath  = `${mediaFolder}/image-${message.key.id}.${mimeTypeMedia}`
    if(fs.existsSync(filePath)){
        console.log(`IMAGEM JA EXISTE ${filePath}`)
        messageData.mediaUrl = filePath
    } else {
        messageData.mediaUrl = await downloadAndSaveMedia(message, 'image', conn)
    }
    if(message.message?.imageMessage?.caption){
        messageData.mediaCaption = message.message.imageMessage.caption
    }
}