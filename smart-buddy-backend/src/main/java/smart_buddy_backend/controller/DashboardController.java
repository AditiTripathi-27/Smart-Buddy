
package smart_buddy_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import smart_buddy_backend.entity.ActivityLog;
import smart_buddy_backend.repository.ActivityLogRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ActivityLogRepository activityLogRepository;

    public DashboardController(
            ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    // 1. Get Recent Activity for logged-in user
    @GetMapping("/activity/recent")
    public List<ActivityLog> getRecentTransactions(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first"
            );
        }

        String userEmail = authentication.getName();

        return activityLogRepository
                .findTop5ByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    // 2. Save Recent Activity
    @PostMapping("/activity")
    public ActivityLog saveActivity(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first"
            );
        }

        String description = request.get("description");

        if (description == null || description.isBlank()
                || description.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Description must contain 1 to 500 characters"
            );
        }

        ActivityLog activity = new ActivityLog(
                authentication.getName(),
                description.trim()
        );

        return activityLogRepository.save(activity);
    }
}
