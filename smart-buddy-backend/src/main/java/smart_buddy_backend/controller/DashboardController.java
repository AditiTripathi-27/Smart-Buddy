package smart_buddy_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    // 1. Dashboard Metrics
    @GetMapping("/dashboard/stats")
    public Map<String, Integer> getDashboardStats() {
        return Map.of(
            "totalAssignments", 8,
            "completedAssignments", 3,
            "pendingAssignments", 5,
            "totalSubjects", 6,
            "totalTasks", 4,
            "upcomingDeadlines", 2
        );
    }

    // 2. Recent Activity
    @GetMapping("/activity/recent")
    public List<Map<String, String>> getRecentTransactions() {
        return List.of(
            Map.of(
                "id", "ASG1001",
                "title", "Java Assignment",
                "subject", "Java",
                "type", "ASSIGNMENT",
                "status", "COMPLETED"
            ),
            Map.of(
                "id", "ASG1002",
                "title", "Maths Questions",
                "subject", "Mathematics",
                "type", "TASK",
                "status", "PENDING"
            ),
            Map.of(
                "id", "ASG1003",
                "title", "DBMS Assignment",
                "subject", "DBMS",
                "type", "ASSIGNMENT",
                "status", "PENDING"
            ),
            Map.of(
                "id", "ASG1004",
                "title", "Environmental Studies",
                "subject", "ESE",
                "type", "ASSIGNMENT",
                "status", "COMPLETED"
            ),
            Map.of(
                "id", "ASG1005",
                "title", "Operating Systems Notes",
                "subject", "OS",
                "type", "TASK",
                "status", "PENDING"
            ),
            Map.of(
                "id", "ASG1006",
                "title", "Python Practical File",
                "subject", "Python",
                "type", "PRACTICAL",
                "status", "COMPLETED"
            ),
            Map.of(
                "id", "ASG1007",
                "title", "Engineering Mechanics Assignment",
                "subject", "EM",
                "type", "ASSIGNMENT",
                "status", "PENDING"
            ),
            Map.of(
                "id", "ASG1008",
                "title", "Indian Knowledge Systems Essay",
                "subject", "IKS",
                "type", "ASSIGNMENT",
                "status", "PENDING"
            )
        );
    }

    // 3. Open Account
    @PostMapping("/account")
    public String createNewAccount() {
        return "New account created successfully";
    }

    // 4. Fund Transfer
    @PostMapping("/transfer")
    public String processTransfer() {
        return "Fund transfer processed successfully";
    }
}