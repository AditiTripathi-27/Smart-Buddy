package smart_buddy_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.entity.Resource;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByBranchAndDivisionAndSubject(
            String branch,
            String division,
            String subject
    );
}