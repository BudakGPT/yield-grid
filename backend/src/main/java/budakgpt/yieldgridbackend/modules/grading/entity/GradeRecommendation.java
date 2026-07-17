package budakgpt.yieldgridbackend.modules.grading.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "grade_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GradeRecommendation {
    @Id
    @Column(length = 1)
    private String grade;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;
}
