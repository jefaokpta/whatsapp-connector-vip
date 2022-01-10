import express from "express";
import {WhatsConnection} from "../whatsapp/whatsConnection";

const conn = WhatsConnection.connection
export const profilePicture = express()

profilePicture.get('/:remoteJid', (req, res) => {
    conn.getProfilePicture (req.params.remoteJid)
        .then(data => {
            //console.log(data)
            res.json({picture: data})
        })
        .catch(error => {
            console.log(error.message)
            res.status(404).json({
                errorMessage: error.message
            })
        })
})