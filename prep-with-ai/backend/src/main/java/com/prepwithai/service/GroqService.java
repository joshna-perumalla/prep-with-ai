package com.prepwithai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GroqService {

    @Value("${app.groq.api-key}")
    private String apiKey;

    @Value("${app.groq.api-url}")
    private String apiUrl;

    @Value("${app.groq.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> generateQuestions(String domain, String techStack, String difficulty) {
        String techPart = (techStack != null && !techStack.isBlank()) ? " focusing on " + techStack : "";
        String prompt = String.format(
            "Generate exactly 5 %s-level interview questions for the %s domain%s. " +
            "Return ONLY a JSON array of strings, no other text. Example: [\"Q1\",\"Q2\",\"Q3\",\"Q4\",\"Q5\"]",
            difficulty, domain, techPart
        );
        String response = callGroq(prompt);
        return parseJsonArray(response);
    }

    public Map<String, Object> evaluateAnswer(String question, String answer) {
        String prompt = String.format(
            "You are a friendly and encouraging interview coach. Evaluate this interview answer generously. " +
            "Focus on what the candidate got RIGHT. Be lenient — if they show understanding of the core concept, " +
            "even partially or informally, give them credit. Only deduct points for clearly wrong or missing key concepts. " +
            "A short but correct answer should still score well (6-7+). " +
            "Question: \"%s\" Answer: \"%s\" " +
            "Return ONLY a JSON object with two fields: " +
            "\"feedback\" (string, 2-3 sentences of constructive feedback) and " +
            "\"score\" (integer 1-10). Example: {\"feedback\":\"Good answer...\",\"score\":7}",
            question, answer
        );
        String response = callGroq(prompt);
        return parseJsonObject(response);
    }

    public Map<String, Object> generateDsaProblem(String difficulty, String topic) {
        String topicPart = (topic != null && !topic.isBlank()) ? " on the topic of " + topic : "";
        String prompt = String.format(
            "Generate a %s-level DSA coding problem%s suitable for a coding interview. " +
            "The problem should read input from STDIN and print output to STDOUT. " +
            "Return ONLY a JSON object with these fields: " +
            "\"title\" (string, short problem name), " +
            "\"description\" (string, full problem statement with clear input/output format), " +
            "\"constraints\" (string, input constraints), " +
            "\"sampleInput\" (string, one sample input), " +
            "\"sampleOutput\" (string, expected output for the sample input), " +
            "\"testCases\" (array of objects with \"input\" and \"expectedOutput\" strings, exactly 5 test cases including edge cases). " +
            "Make sure test cases have simple, deterministic outputs. " +
            "Example format: {\"title\":\"Two Sum\",\"description\":\"Given...\",\"constraints\":\"1<=n<=1000\"," +
            "\"sampleInput\":\"4\\n2 7 11 15\\n9\",\"sampleOutput\":\"0 1\"," +
            "\"testCases\":[{\"input\":\"...\",\"expectedOutput\":\"...\"}]}",
            difficulty, topicPart
        );
        String response = callGroq(prompt);
        return parseJsonObject(response);
    }

    private String callGroq(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.7,
            "max_tokens", 2048
        );

        try {
            ResponseEntity<JsonNode> resp = restTemplate.exchange(
                apiUrl, HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class
            );
            return resp.getBody()
                    .path("choices").get(0)
                    .path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    private List<String> parseJsonArray(String raw) {
        try {
            String json = extractJson(raw, "[", "]");
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of("Could not parse AI response. Please try again.");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonObject(String raw) {
        try {
            String json = extractJson(raw, "{", "}");
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("feedback", "Could not parse AI feedback.", "score", 5);
        }
    }

    private String extractJson(String raw, String startChar, String endChar) {
        int start = raw.indexOf(startChar);
        int end = raw.lastIndexOf(endChar);
        if (start >= 0 && end > start) {
            return raw.substring(start, end + 1);
        }
        return raw;
    }
}
