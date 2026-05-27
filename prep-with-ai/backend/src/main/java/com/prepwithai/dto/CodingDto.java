package com.prepwithai.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class CodingDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class GenerateRequest {
        private String difficulty;
        private String topic;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SubmitRequest {
        private String code;
        private String language;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProblemResponse {
        private Long id;
        private String title;
        private String description;
        private String difficulty;
        private String constraints;
        private String sampleInput;
        private String sampleOutput;
        private boolean solved;
        private Integer passedTests;
        private Integer totalTests;
        private String userCode;
        private String language;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestCaseResult {
        private int testNumber;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitResponse {
        private int totalTests;
        private int passedTests;
        private boolean allPassed;
        private List<TestCaseResult> results;
        private String error;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestCase {
        private String input;
        private String expectedOutput;
    }
}
