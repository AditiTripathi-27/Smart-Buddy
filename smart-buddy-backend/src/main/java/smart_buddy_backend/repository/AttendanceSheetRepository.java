
package smart_buddy_backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.entity.AttendanceSheet;

public interface AttendanceSheetRepository
        extends JpaRepository<AttendanceSheet, Long> {

    List<AttendanceSheet> findByBranchAndDivisionOrderByUploadedAtDesc(
            String branch, String division);
}
