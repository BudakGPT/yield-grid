package budakgpt.yieldgridbackend.modules.listing.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.listing.dto.CreateListingRequest;
import budakgpt.yieldgridbackend.modules.listing.dto.ListingResponse;
import budakgpt.yieldgridbackend.modules.listing.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/listings")
@Tag(name = "Listings", description = "Graded produce offered by farmers")
public class ListingController {
    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Create a listing from the current farmer's grading result")
    public ResponseEntity<ListingResponse> create(@Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "List open marketplace listings")
    public List<ListingResponse> findOpen(
            @RequestParam(defaultValue = "open") String status,
            @RequestParam(required = false) BuyerSegment segment
    ) {
        if (!"open".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Only status=open is supported");
        }
        return listingService.findOpen(segment);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List all listings owned by the current farmer")
    public List<ListingResponse> findMine() {
        return listingService.findMine();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "Get a listing, including listings that are no longer open")
    public ListingResponse findById(@PathVariable UUID id) {
        return listingService.findById(id);
    }
}
