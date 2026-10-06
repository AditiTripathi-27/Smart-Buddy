package smart_buddy_backend.controller;

import org.springframework.web.bind.annotation.*;
import smart_buddy_backend.entity.Assignment;
import smart_buddy_backend.repository.AssignmentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping
    public Assignment addAssignment(@RequestBody Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteAssignment(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
    }
}