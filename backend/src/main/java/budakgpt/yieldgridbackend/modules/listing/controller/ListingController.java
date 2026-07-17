package budakgpt.yieldgridbackend.modules.listing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.listing.dto.CreateListingRequest;
import budakgpt.yieldgridbackend.modules.listing.dto.ListingResponse;
import budakgpt.yieldgridbackend.modules.listing.service.ListingService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ListingResponse> create(@Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    public List<ListingResponse> findOpen(
            @RequestParam(defaultValue = "open") String status,
            @RequestParam(required = false) BuyerSegment segment
    ) {
        if (!"open".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Only status=open is supported on the demo path");
        }
        return listingService.findOpen(segment);
    }
}
