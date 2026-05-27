package com.prepwithai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class InterviewDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StartRequest {
        @NotBlank private String domain;
        private String techStack;
        @NotBlank private String difficulty;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AnswerRequest {
        @NotBlank private String answer;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SessionResponse {
        private Long id;
        private String domain;
        private String techStack;
        private String difficulty;
        private Double score;
        private boolean completed;
        private LocalDateTime createdAt;
        private List<QuestionResponse> questions;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuestionResponse {
        private Long id;
        private int questionOrder;
        private String question;
        private String userAnswer;
        private String aiFeedback;
        private Integer score;
    }
}
