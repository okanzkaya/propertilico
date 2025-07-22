// In server/routes/ticketRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const ticketController = require("../controllers/ticketController");

router.use(protect);

// Modify the notes route to handle the upload properly
router.post("/:id/notes", (req, res, next) => {
  console.log("Processing note upload request");
  ticketController.upload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message,
        });
      }
      return res.status(400).json({
        message: "Invalid file type",
        error: err.message,
      });
    }
    next();
  });
}, ticketController.addNote);

// Other routes remain the same
router
  .route("/")
  .get(ticketController.getTickets)
  .post(ticketController.upload, ticketController.createTicket);

router
  .route("/:id")
  .get(ticketController.getTicketById)
  .put(ticketController.upload, ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

router.get(
  "/:ticketId/attachments/:attachmentId/download",
  ticketController.downloadAttachment
);

router.delete("/:id/attachments/:fileId", ticketController.deleteAttachment);

module.exports = router;