package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import com.PlacementPortal.Placement.Sarthi.repository.MessageRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
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

    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    @Transactional
    public void updateMessageStatus(Long id, String status) {
        messageRepository.updateStatus(id, status);
    }

    @Transactional
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }

    public long getUnreadCount() {
        return messageRepository.countByStatus("unread");
    }
}