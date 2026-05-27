package com.prepwithai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    private int questionOrder;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private Integer score;
}
