package budakgpt.yieldgridbackend.modules.grading.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.grading.entity.GradeRecommendation;

public interface GradeRecommendationRepository extends JpaRepository<GradeRecommendation, String> {
}
