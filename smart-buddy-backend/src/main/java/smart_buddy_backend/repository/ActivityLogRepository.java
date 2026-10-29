
package smart_buddy_backend.repository;

import smart_buddy_backend.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop5ByUserEmailOrderByCreatedAtDesc(
        String userEmail
    );
}
