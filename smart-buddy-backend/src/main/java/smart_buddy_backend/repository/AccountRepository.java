package smart_buddy_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import smart_buddy_backend.model.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);
}