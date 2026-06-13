package application.dto.request;

import domain.model.Project;
import domain.model.Task;
import domain.model.TaskStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TaskRequestDTO(
        Long id,
        @NotBlank(message = "El Titulo es obligatorio")
        String title,
        @NotNull(message = "Las horas estimadas son requeridas")
        @Min(value = 1, message = "Las horas estimadas deben ser mayor a 0")
        Integer estimatedHours,
        String assignee,
        @NotNull(message = "El estado es requerido")
        TaskStatus status,
        LocalDateTime finishedAt,
        LocalDateTime createdAt

) {}
