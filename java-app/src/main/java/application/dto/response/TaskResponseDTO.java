package application.dto.response;

import domain.model.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponseDTO(
        Long id,
        String title,
        Long projectId,
        Integer estimatedHours,
        String assignee,
        TaskStatus status,
        LocalDateTime createdAt,
        LocalDateTime finishedAt
){}
