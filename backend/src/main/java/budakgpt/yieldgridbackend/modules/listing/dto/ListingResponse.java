package budakgpt.yieldgridbackend.modules.listing.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import budakgpt.yieldgridbackend.modules.grading.dto.GradingResultResponse;

public record ListingResponse(
        UUID id,
        @JsonProperty("scan_id") UUID scanId,
        @JsonProperty("farmer_id") UUID farmerId,
        @JsonProperty("farmer_name") String farmerName,
        @JsonProperty("produce_type") String produceType,
        @JsonProperty("unit_price") BigDecimal unitPrice,
        @JsonProperty("est_weight_kg") BigDecimal estWeightKg,
        @JsonProperty("grade_distribution") GradingResultResponse.GradeDistribution gradeDistribution,
        @JsonProperty("est_shelf_life") GradingResultResponse.ShelfLifeEstimate estShelfLife,
        @JsonProperty("photo_url") String photoUrl,
        @JsonProperty("ipfs_cid") String ipfsCid,
        @JsonProperty("rubric_version") String rubricVersion,
        @JsonProperty("suggested_segment") String suggestedSegment,
        String status
) {
}
