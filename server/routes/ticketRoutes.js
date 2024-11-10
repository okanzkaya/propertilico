const express = require("express");
const router = express.Router();
const multer = require("multer"); // Add this import
const { protect } = require("../middleware/authMiddleware");
const ticketController = require("../controllers/ticketController");

router.use(protect);

router
  .route("/")
  .get(ticketController.getTickets)
  .post((req, res, next) => {
    ticketController.upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          message: "Invalid file type",
          error: err.message,
        });
      }
      next();
    });
  }, ticketController.createTicket);

router
  .route("/:id")
  .get(ticketController.getTicketById)
  .put((req, res, next) => {
    ticketController.upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          message: "Invalid file type",
          error: err.message,
        });
      }
      next();
    });
  }, ticketController.updateTicket)
  .delete(ticketController.deleteTicket);

router.post(
  "/:id/notes",
  (req, res, next) => {
    ticketController.upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          message: "Invalid file type",
          error: err.message,
        });
      }
      next();
    });
  },
  ticketController.addNote
);
router.delete("/:id/attachments/:fileId", ticketController.deleteAttachment);
// In server/routes/ticketRoutes.js

router.get(
  "/:ticketId/attachments/:attachmentId/download",
  protect,
  ticketController.downloadAttachment
);
module.exports = router;
