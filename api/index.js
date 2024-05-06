const express = require("express");
const upload = require("./multerConfig");
const router = express.Router();
const contactCtrl = require("../controller/index");
const authCtrl = require("../controller/auth");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/logout", authMiddleware.checkToken, authCtrl.signOut);

router.get("/current", authMiddleware.checkToken, authCtrl.getCurrentUser);

// Corregir la ruta para getAllContacts
router.get("/contacts", authMiddleware.checkToken, contactCtrl.getAllContacts);

// Corregir la ruta para getContactById
router.get(
  "/:contactId",
  authMiddleware.checkToken,
  contactCtrl.getContactById
);

// Corregir la ruta para addContact
router.post("/contacts", authMiddleware.checkToken, contactCtrl.addContact);

// Corregir la ruta para deleteContact
router.delete(
  "/:contactId",
  authMiddleware.checkToken,
  contactCtrl.deleteContact
);

router.put("/:contactId", authMiddleware.checkToken, contactCtrl.updateContact);

router.put(
  "/:contactId/favorite",
  authMiddleware.checkToken,
  contactCtrl.updateStatusContact
);

router.post("/signup", authCtrl.signUp);

router.post("/login", authCtrl.signIn);

router.patch(
  "/users/avatars",
  authMiddleware.checkToken,
  upload.single("avatar"),
  authCtrl.updateAvatar
);

module.exports = router;
