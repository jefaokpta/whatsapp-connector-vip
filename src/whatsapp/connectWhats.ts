import {WhatsConnection} from "./whatsConnection";
import {QrCodeHandle} from "../util/qrCodeHandle";
import {authConfirmed, restoreAuth} from "../util/authHandle";
import {messageAnalisator} from "../util/messageHandle";


const conn = WhatsConnection.connection;

export async function connectToWhatsApp () {
    /** The version of WhatsApp Web we're telling the servers we are
     VERSAO DO WHATS WEB
     */
    conn.version = [2, 2140, 12];

    conn.connectOptions = {
        /** fails the connection if no data is received for X seconds */
        maxIdleTimeMs: 60_000,
        /** maximum attempts to connect */
        maxRetries: Infinity,
        /** max time for the phone to respond to a connectivity test */
        phoneResponseTime: 30_000,
        /** minimum time between new connections */
        connectCooldownMs: 10000,
        /** agent used for WS connections (could be a proxy agent) */
        agent: undefined,
        /** agent used for fetch requests -- uploading/downloading media */
        fetchAgent: undefined,
        /** always uses takeover for connecting */
        alwaysUseTakeover: true,
        /** log QR to terminal */
        logQR: true
    }

    // called when WA sends chats
    // this can take up to a few minutes if you have thousands of chats!
    conn.on('chats-received', async ({ hasNewChats }) => {
        console.log(`you have ${conn.chats.length} chats, new chats available: ${hasNewChats}`)

        const unread = await conn.loadAllUnreadMessages ()
        console.log ("you have " + unread.length + " unread messages")
        let statusApiLastPost = 500
        const remoteJidsMap = new Map()
        for (const message of unread) {
            remoteJidsMap.set(message.key.remoteJid, null)
            const responseApi = await messageAnalisator(message, conn)
            if (responseApi){
                statusApiLastPost = responseApi.status
            }
        }
        if(statusApiLastPost === 200){
            for (const remoteJid of remoteJidsMap.keys()) {
                conn.chatRead(remoteJid)
                    .then(() => console.log(`CHAT BOOT ${remoteJid} MARCADO COMO LIDO`))
                    .catch(error => console.log(error.message))
            }
        }
    })

    // called when WA sends chats
    // this can take up to a few minutes if you have thousands of contacts!
    // conn.on('contacts-received', () => {
    //     console.log('you have ' + Object.keys(conn.contacts).length + ' contacts')
    // });

    conn.on ('credentials-updated', () => { // salva sessao
        // save credentials whenever updated
        console.log (`CREDENCIAIS ATUALIZADAS? QUANDO ACONTECE ISSO!`)
        authConfirmed(conn.base64EncodedAuthInfo())
    });

    conn.on('qr', qr => {
        // Now, use the 'qr' string to display in QR UI or send somewhere
        console.log('QR PARA MOSTRAR NA WEB')
        console.log(qr)
        QrCodeHandle.sendQrCode(qr)
    });

    console.log('BUSCANDO AUTH NO BANCO')
    await restoreAuth().then(res => {
        const authInfo = res.data
        //console.log(authInfo)
        conn.loadAuthInfo(authInfo)
    }).catch(e => console.log(e.message))

    console.log('TENTANDO CONEXAO')

    async function connectWA() {
        await conn.connect()
            .then(() => {
                authConfirmed(conn.base64EncodedAuthInfo())
                console.log('CONECTOU COM SUCESSO')
            }).catch(error => console.log(error.message))
    }

    await connectWA();

    conn.on('close', reason => {
        console.log(`DESCONECTADO ${reason.reason} RECONECTANDO? ${reason.isReconnecting}`)
        setTimeout(() => {
            connectWA()
        }, 180000)
    })

    conn.on('chat-update', async chatUpdate => {
        // `chatUpdate` is a partial object, containing the updated properties of the chat
        // received a new message
        if (chatUpdate.messages && chatUpdate.count) {
            console.log('MESSAGE COM UPDATE COUNT')
            const message = chatUpdate.messages.all()[0]
            const responseAPi = await messageAnalisator(message, conn) // PODE RETORNAR OBJ AXIOS OU NAO
            if(responseAPi && responseAPi.status === 200){
                conn.chatRead(message.key.remoteJid!!)
                    .then(() => console.log(`CHAT UPDATE ${message.key.remoteJid} MARCADO COMO LIDO`))
                    .catch(error => console.log(error.message))
            }
            console.log(`CHAT UPDATE ${responseAPi?.status}`)
        }
        else if(chatUpdate.presences){
            console.log(chatUpdate)
            console.log('PRESENCA ACIMA')
        }
        else if(chatUpdate.messages){
            const message = chatUpdate.messages.all()[0]
            console.log(message)
            try {
                const responseApi = await messageAnalisator(message, conn) // PODE RETORNAR OBJ AXIOS OU NAO
                console.log('POSSIVELMENTE MENSAGEM ENVIADA '+ responseApi?.status)
            }catch (error) {
                console.log(error)
            }

        }
        else if(chatUpdate.imgUrl){
            console.log('APARENTEMENTE TROCA DE IMG DE PERFIL')
            console.log(chatUpdate)
        }
        else {
            console.log('EVENTOS NAO DEFINIDOS AINDA')
            console.log (chatUpdate)
        }


    })


}