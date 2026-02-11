package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import com.PlacementPortal.Placement.Sarthi.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // PUBLIC - contact form
    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> saveContactMessage(@RequestBody Message message) {
        try {
            Message savedMessage = messageService.saveMessage(message);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message sent successfully!",
                    "data", savedMessage));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllMessages() {
        try {
            List<Message> messages = messageService.getAllMessages();
            long unreadCount = messageService.getUnreadCount();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages,
                    "unreadCount", unreadCount));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch messages: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getMessagesByStatus(@PathVariable String status) {
        try {
            List<Message> messages = messageService.getMessagesByStatus(status);
            return ResponseEntity.ok(Map.of("success", true, "messages", messages));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch messages: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMessages(@RequestParam String query) {
        try {
            List<Message> messages = messageService.searchMessages(query);
            return ResponseEntity.ok(Map.of("success", true, "messages", messages));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to search messages: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateMessageStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusData) {
        try {
            messageService.updateMessageStatus(id, statusData.get("status"));
            return ResponseEntity.ok(Map.of(
                    "success", true, "message", "Message status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update message status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable String id) {
        try {
            messageService.deleteMessage(id);
            return ResponseEntity.ok(Map.of(
                    "success", true, "message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to delete message: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMessageById(@PathVariable String id) {
        try {
            Optional<Message> message = messageService.getMessageById(id);
            if (message.isPresent()) {
                return ResponseEntity.ok(Map.of("success", true, "message", message.get()));
            }
            return ResponseEntity.status(404).body(Map.of(
                    "success", false, "message", "Message not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch message: " + e.getMessage()));
        }
    }
}