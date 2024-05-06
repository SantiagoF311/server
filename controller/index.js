const contacts = require("../service/index");
const contactModel = require("../service/schemas/contacts");

const getAllContacts = async (req, res, next) => {
  try {
    const contact = await contacts.listContacts(req.user._id);
    res.json({
      status: "success",
      code: 200,
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;

    const contact = await contacts.getContactById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (contact.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this contact" });
    }

    res.json({
      status: "success",
      code: 200,
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error("Error in getContactById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addContact = async (req, res, next) => {
  try {
    const { error } = contactModel.validateAdd(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingContact = await contacts.findExistingContact(req.body.name, req.user._id);

    if (existingContact) {
      return res.status(410).json({ message: 'Contact with the same name already exists' });
    }

    const newContact = await contacts.addContact({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json(newContact);
  } catch (error) {
    if (error.message === 'Contact with the same name already exists') {
      return res.status(409).json({ message: 'Contact with the same name already exists' });
    }

    res.status(500).json({ message: error.message });
  }
};


const deleteContact = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await contacts.getContactById(contactId);

    if (contact) {
      if (contact.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this contact" });
      }

      const deletedContact = await contacts.removeContact(contactId);
      res.json({
        status: "success",
        code: 200,
        message: "Contact deleted",
        data: {
          contact: deletedContact,
        },
      });
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    console.error("Error in deleteContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no puede estar vacío." });
    }

    const contact = await contacts.getContactById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (contact.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this contact" });
    }

    const { error } = contactModel.validateUpdate(body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedContact = await contacts.updateContact(contactId, body);

    res.json({
      message: "Contact updated successfully:",
      updatedContact,
    });
  } catch (error) {
    console.error("Error in updateContact:", error);

    if (error.isJoi) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Contact not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const body = req.body;

    if (Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "El cuerpo de la solicitud no puede estar vacío." });
    }

    const allowedFields = ["favorite"];
    const invalidFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `No se permiten cambios en los campos: ${invalidFields.join(
          ", "
        )}`,
      });
    }

    const contact = await contacts.getContactById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contacto no encontrado" });
    }

    if (contact.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this contact's status" });
    }

    const updatedStatus = await contacts.updateStatusContact(contactId, body);

    if (updatedStatus.status === 404) {
      return res.status(404).json({ message: "Contacto no encontrado" });
    }

    if (updatedStatus.status === 200) {
      res.json({
        status: "success",
        code: 200,
        data: {
          contact: updatedStatus.contact,
        },
      });
    } else {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  } catch (error) {
    console.error("Error en updateStatusContact:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContact,
  updateStatusContact,
};
