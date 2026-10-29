
package smart_buddy_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.entity.DueDate;
import java.util.List;

public interface DueDateRepository extends JpaRepository<DueDate, Long> {

    List<DueDate> findByBranchAndDivision(
            String branch,
            String division
    );
}
