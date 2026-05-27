package com.prepwithai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwithai.dto.CodingDto.*;
import com.prepwithai.model.CodingProblem;
import com.prepwithai.model.User;
import com.prepwithai.repository.CodingProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CodingService {

    private final CodingProblemRepository problemRepo;
    private final GroqService groqService;
    private final PistonService pistonService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ProblemResponse generateProblem(User user, GenerateRequest req) {
        Map<String, Object> aiResult = groqService.generateDsaProblem(req.getDifficulty(), req.getTopic());

        String testCasesJson;
        try {
            testCasesJson = objectMapper.writeValueAsString(aiResult.get("testCases"));
        } catch (Exception e) {
            testCasesJson = "[]";
        }

        CodingProblem problem = CodingProblem.builder()
                .user(user)
                .title((String) aiResult.getOrDefault("title", "DSA Problem"))
                .description((String) aiResult.getOrDefault("description", ""))
                .difficulty(req.getDifficulty())
                .constraints((String) aiResult.getOrDefault("constraints", ""))
                .sampleInput((String) aiResult.getOrDefault("sampleInput", ""))
                .sampleOutput((String) aiResult.getOrDefault("sampleOutput", ""))
                .testCasesJson(testCasesJson)
                .totalTests(5)
                .solved(false)
                .build();

        problemRepo.save(problem);
        return toProblemResponse(problem);
    }

    @Transactional
    public SubmitResponse submitCode(User user, Long problemId, SubmitRequest req) {
        CodingProblem problem = problemRepo.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        if (!problem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        List<TestCase> testCases;
        try {
            testCases = objectMapper.readValue(problem.getTestCasesJson(),
                    new TypeReference<List<TestCase>>() {});
        } catch (Exception e) {
            return SubmitResponse.builder().error("Failed to parse test cases").build();
        }

        List<TestCaseResult> results = new ArrayList<>();
        int passed = 0;

        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            PistonService.ExecutionResult exec = pistonService.execute(req.getLanguage(), req.getCode(), tc.getInput());

            boolean testPassed = false;
            String actual = "";

            if (exec.success()) {
                actual = exec.stdout() != null ? exec.stdout().trim() : "";
                String expected = tc.getExpectedOutput() != null ? tc.getExpectedOutput().trim() : "";
                testPassed = actual.equals(expected);
                if (testPassed) passed++;
            } else {
                actual = exec.stderr() != null ? exec.stderr() : "Execution error";
            }

            results.add(TestCaseResult.builder()
                    .testNumber(i + 1)
                    .input(tc.getInput())
                    .expectedOutput(tc.getExpectedOutput())
                    .actualOutput(actual)
                    .passed(testPassed)
                    .build());
        }

        problem.setUserCode(req.getCode());
        problem.setLanguage(req.getLanguage());
        problem.setPassedTests(passed);
        problem.setSolved(passed == testCases.size());
        problemRepo.save(problem);

        return SubmitResponse.builder()
                .totalTests(testCases.size())
                .passedTests(passed)
                .allPassed(passed == testCases.size())
                .results(results)
                .build();
    }

    @Transactional(readOnly = true)
    public ProblemResponse getProblem(User user, Long problemId) {
        CodingProblem p = problemRepo.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        if (!p.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return toProblemResponse(p);
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> getHistory(User user) {
        return problemRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toProblemResponse).toList();
    }

    private ProblemResponse toProblemResponse(CodingProblem p) {
        return ProblemResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .difficulty(p.getDifficulty())
                .constraints(p.getConstraints())
                .sampleInput(p.getSampleInput())
                .sampleOutput(p.getSampleOutput())
                .solved(p.isSolved())
                .passedTests(p.getPassedTests())
                .totalTests(p.getTotalTests())
                .userCode(p.getUserCode())
                .language(p.getLanguage())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
