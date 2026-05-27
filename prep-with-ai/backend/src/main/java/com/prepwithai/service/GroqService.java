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
        String prompt = String.format(
            "Generate exactly 5 %s-level interview questions for %s in the %s domain. " +
            "Return ONLY a JSON array of strings, no other text. Example: [\"Q1\",\"Q2\",\"Q3\",\"Q4\",\"Q5\"]",
            difficulty, techStack, domain
        );
        String response = callGroq(prompt);
        return parseJsonArray(response);
    }

    public Map<String, Object> evaluateAnswer(String question, String answer) {
        String prompt = String.format(
            "Evaluate this interview answer. Question: \"%s\" Answer: \"%s\" " +
            "Return ONLY a JSON object with two fields: " +
            "\"feedback\" (string, 2-3 sentences of constructive feedback) and " +
            "\"score\" (integer 1-10). Example: {\"feedback\":\"Good answer...\",\"score\":7}",
            question, answer
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
            "max_tokens", 1024
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
