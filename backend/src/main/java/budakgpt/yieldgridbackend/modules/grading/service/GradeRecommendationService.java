package budakgpt.yieldgridbackend.modules.grading.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.grading.dto.GradeRecommendationResponse;
import budakgpt.yieldgridbackend.modules.grading.dto.UpdateGradeRecommendationRequest;
import budakgpt.yieldgridbackend.modules.grading.entity.GradeRecommendation;
import budakgpt.yieldgridbackend.modules.grading.repository.GradeRecommendationRepository;

@Service
public class GradeRecommendationService {
    private static final Map<String, GradeRecommendationResponse> DEFAULTS = defaults();

    private final GradeRecommendationRepository repository;

    public GradeRecommendationService(GradeRecommendationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<GradeRecommendationResponse> findAll() {
        Map<String, GradeRecommendationResponse> recommendations = new LinkedHashMap<>(DEFAULTS);
        repository.findAll().forEach(item -> recommendations.put(item.getGrade(), toResponse(item)));
        return List.of(
                recommendations.get("A"),
                recommendations.get("B"),
                recommendations.get("C")
        );
    }

    @Transactional
    public GradeRecommendationResponse update(String rawGrade, UpdateGradeRecommendationRequest request) {
        String grade = normalizeGrade(rawGrade);
        GradeRecommendation recommendation = repository.findById(grade)
                .orElseGet(() -> new GradeRecommendation(grade, "", ""));
        recommendation.setTitle(request.title().trim());
        recommendation.setDescription(request.description().trim());
        return toResponse(repository.save(recommendation));
    }

    private String normalizeGrade(String value) {
        String grade = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!DEFAULTS.containsKey(grade)) {
            throw new IllegalArgumentException("Grade must be A, B, or C");
        }
        return grade;
    }

    private GradeRecommendationResponse toResponse(GradeRecommendation recommendation) {
        return new GradeRecommendationResponse(
                recommendation.getGrade(),
                recommendation.getTitle(),
                recommendation.getDescription()
        );
    }

    private static Map<String, GradeRecommendationResponse> defaults() {
        Map<String, GradeRecommendationResponse> defaults = new LinkedHashMap<>();
        defaults.put("A", new GradeRecommendationResponse(
                "A",
                "Premium retail & hospitality",
                "Best suited for premium fresh retail, supermarkets, hotels, restaurants, and direct consumers."
        ));
        defaults.put("B", new GradeRecommendationResponse(
                "B",
                "Wholesale & food manufacturing",
                "Suitable for wholesale distribution, commercial kitchens, packaged foods, sauces, and other manufacturing inputs."
        ));
        defaults.put("C", new GradeRecommendationResponse(
                "C",
                "Processing, feed & fertilizer",
                "Route away from premium fresh retail toward safe processing, animal feed, compost, or fertilizer based on food-safety review."
        ));
        return Map.copyOf(defaults);
    }
}
