package smart_buddy_backend.controller;

import org.springframework.web.bind.annotation.*;
import smart_buddy_backend.entity.Assignment;
import smart_buddy_backend.repository.AssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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

    @PutMapping("/{id}")
    public Assignment updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment updatedAssignment) {

        Assignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Assignment not found"));

        existing.setTitle(updatedAssignment.getTitle());
        existing.setSubject(updatedAssignment.getSubject());
        existing.setDueDate(updatedAssignment.getDueDate());
        existing.setStatus(updatedAssignment.getStatus());

        return assignmentRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteAssignment(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
    }
}