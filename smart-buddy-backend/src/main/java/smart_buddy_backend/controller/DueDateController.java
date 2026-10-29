
package smart_buddy_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import smart_buddy_backend.entity.DueDate;
import smart_buddy_backend.repository.DueDateRepository;

import java.util.List;

@RestController
@RequestMapping("/api/due-dates")
@CrossOrigin(origins = "http://localhost:5173")
public class DueDateController {

    private final DueDateRepository dueDateRepository;

    public DueDateController(DueDateRepository dueDateRepository) {
        this.dueDateRepository = dueDateRepository;
    }

    // Faculty: create a deadline
    @PostMapping
    public DueDate addDueDate(@RequestBody DueDate dueDate) {

        validate(dueDate);

        dueDate.setId(null);

        return dueDateRepository.save(dueDate);
    }

    // Student: get deadlines for their branch and division
    @GetMapping
    public List<DueDate> getDueDates(
            @RequestParam String branch,
            @RequestParam String division) {

        if (branch.isBlank() || division.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Branch and division are required"
            );
        }

        return dueDateRepository.findByBranchAndDivision(
                branch,
                division
        );
    }

    // Delete a deadline by ID
    @DeleteMapping("/{id}")
    public void deleteDueDate(@PathVariable Long id) {

        if (!dueDateRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Due date not found"
            );
        }

        dueDateRepository.deleteById(id);
    }

    private void validate(DueDate dueDate) {

        if (dueDate.getTitle() == null
                || dueDate.getTitle().isBlank()
                || dueDate.getSubject() == null
                || dueDate.getSubject().isBlank()
                || dueDate.getBranch() == null
                || dueDate.getBranch().isBlank()
                || dueDate.getDivision() == null
                || dueDate.getDivision().isBlank()
                || dueDate.getDueDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title, subject, branch, division and due date are required"
            );
        }
    }
}
