
package smart_buddy_backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.entity.Timetable;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByBranchAndDivision(String branch, String division);
}
