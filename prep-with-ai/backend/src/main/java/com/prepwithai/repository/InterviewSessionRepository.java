package com.prepwithai.repository;

import com.prepwithai.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT s.domain FROM InterviewSession s WHERE s.completed = true")
    List<String> findDistinctDomains();

    @Query("SELECT DISTINCT s.difficulty FROM InterviewSession s WHERE s.completed = true")
    List<String> findDistinctDifficulties();

    @Query("SELECT DISTINCT u.college FROM InterviewSession s JOIN s.user u WHERE s.completed = true AND u.college IS NOT NULL AND u.college <> ''")
    List<String> findDistinctColleges();

    List<InterviewSession> findByCompletedTrue();
}
