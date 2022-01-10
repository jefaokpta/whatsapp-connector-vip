import express from 'express';
import {connectToWhatsApp} from "./whatsapp/connectWhats";
import {profilePicture} from "./controller/profilePictureController";

const router = express()
router.use(express.json())
const port = process.env.PORT || 3001

// run in main file
connectToWhatsApp ()
    .catch (error => console.log("unexpected error: " + error) ) // catch any errors


// router.use('/whats/messages', messageController) //TODO: add message controller
// router.use('/whats/messages/buttons', buttonMessageController) //TODO: add message controller
// router.use('/whats/messages/medias', mediaMessageController) //TODO: add message controller
router.use('/whats/profile/picture', profilePicture) //TODO: add message controller

router.listen(port, () => {
  console.log(`🚀 Server iniciou on port ${port}!`);
});