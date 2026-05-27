package com.prepwithai.repository;

import com.prepwithai.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
}
