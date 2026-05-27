package com.prepwithai.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class PistonService {

    private static final String JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
    private final RestTemplate restTemplate = new RestTemplate();

    // Judge0 CE language IDs
    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
        "python", 71,      // Python 3.8.1
        "java", 62,        // Java (OpenJDK 13.0.1)
        "javascript", 63,  // JavaScript (Node.js 12.14.0)
        "cpp", 54,         // C++ (GCC 9.2.0)
        "c", 50,           // C (GCC 9.2.0)
        "go", 60,          // Go (1.13.5)
        "rust", 73         // Rust (1.40.0)
    );

    public ExecutionResult execute(String language, String code, String stdin) {
        Integer langId = LANGUAGE_IDS.getOrDefault(language.toLowerCase(), 71);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "source_code", code,
            "language_id", langId,
            "stdin", stdin != null ? stdin : "",
            "cpu_time_limit", 5,
            "memory_limit", 128000
        );

        try {
            ResponseEntity<JsonNode> resp = restTemplate.exchange(
                JUDGE0_URL, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class
            );

            JsonNode responseBody = resp.getBody();
            if (responseBody == null) {
                return new ExecutionResult(null, "No response from execution service", false);
            }

            JsonNode status = responseBody.path("status");
            int statusId = status.path("id").asInt(0);
            String statusDesc = status.path("description").asText("");

            String stdout = responseBody.path("stdout").asText("").trim();
            String stderr = responseBody.path("stderr").asText("").trim();
            String compileOutput = responseBody.path("compile_output").asText("").trim();

            // Status 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit, 6 = Compilation Error, etc.
            if (statusId == 6 && !compileOutput.isEmpty()) {
                return new ExecutionResult(null, "Compilation Error:\n" + compileOutput, false);
            }
            if (statusId == 5) {
                return new ExecutionResult(null, "Time Limit Exceeded", false);
            }
            if (statusId == 11) {
                return new ExecutionResult(null, "Runtime Error:\n" + stderr, false);
            }
            if (!stderr.isEmpty() && stdout.isEmpty()) {
                return new ExecutionResult(null, stderr, false);
            }

            return new ExecutionResult(stdout, stderr, true);
        } catch (Exception e) {
            return new ExecutionResult(null, "Execution failed: " + e.getMessage(), false);
        }
    }

    public record ExecutionResult(String stdout, String stderr, boolean success) {}
}
