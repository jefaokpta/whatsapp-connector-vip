import express from 'express';
import {connectToWhatsApp} from "./whatsapp/connectWhats";
import {profilePicture} from "./controller/profilePictureController";
import {buttonMessageController, mediaMessageController, messageController} from "./controller/messageController";

const router = express()
router.use(express.json())
const port = process.env.PORT || 3001

// run in main file teste
connectToWhatsApp ()
    .catch (error => console.log("ERRO NA INICIALIZACAO: " + error) ) // catch any errors


router.use('/whats/messages', messageController)
router.use('/whats/messages/buttons', buttonMessageController)
router.use('/whats/messages/medias', mediaMessageController)
router.use('/whats/profile/picture', profilePicture)

router.listen(port, () => {
  console.log(`🚀 Server iniciou on port ${port}!`);
});