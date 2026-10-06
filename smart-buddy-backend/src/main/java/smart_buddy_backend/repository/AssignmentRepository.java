package smart_buddy_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.entity.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}
