package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import com.PlacementPortal.Placement.Sarthi.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:8001")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Save message from contact form
    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> saveContactMessage(@RequestBody Message message) {
        try {
            Message savedMessage = messageService.saveMessage(message);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message sent successfully!",
                    "data", savedMessage
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to send message: " + e.getMessage()
            ));
        }
    }

    // Get all messages
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMessages() {
        try {
            List<Message> messages = messageService.getAllMessages();
            long unreadCount = messageService.getUnreadCount();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages,
                    "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch messages: " + e.getMessage()
            ));
        }
    }

    // Get messages by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getMessagesByStatus(@PathVariable String status) {
        try {
            List<Message> messages = messageService.getMessagesByStatus(status);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch messages: " + e.getMessage()
            ));
        }
    }

    // Search messages
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMessages(@RequestParam String query) {
        try {
            List<Message> messages = messageService.searchMessages(query);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to search messages: " + e.getMessage()
            ));
        }
    }

    // Update message status
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateMessageStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            messageService.updateMessageStatus(id, status);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message status updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update message status: " + e.getMessage()
            ));
        }
    }

    // Delete message
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long id) {
        try {
            messageService.deleteMessage(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to delete message: " + e.getMessage()
            ));
        }
    }

    // Get message by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMessageById(@PathVariable Long id) {
        try {
            Optional<Message> message = messageService.getMessageById(id);

            if (message.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", message.get()
                ));
            } else {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Message not found"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch message: " + e.getMessage()
            ));
        }
    }
}