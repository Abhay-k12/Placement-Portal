package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import com.PlacementPortal.Placement.Sarthi.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        message.onCreate();
        return messageRepository.save(message);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Message> getMessagesByStatus(String status) {
        return messageRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Message> searchMessages(String query) {
        return messageRepository.findBySenderEmailContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrMessageContainingIgnoreCase(
                query, query, query);
    }

    public Optional<Message> getMessageById(String id) {
        return messageRepository.findById(id);
    }

    public void updateMessageStatus(String id, String status) {
        Optional<Message> messageOpt = messageRepository.findById(id);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setStatus(status);
            message.onUpdate();
            messageRepository.save(message);
        }
    }

    public void deleteMessage(String id) {
        messageRepository.deleteById(id);
    }

    public long getUnreadCount() {
        return messageRepository.countByStatus("unread");
    }
}