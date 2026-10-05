package smart_buddy_backend.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;

import smart_buddy_backend.model.Account;
import smart_buddy_backend.repository.AccountRepository;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountRepository accountRepository;

    public AccountController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    // CREATE
    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountRepository.save(account);
    }

    // READ ALL
    @GetMapping
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return accountRepository.findById(id).orElse(null);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Long id,
                                 @RequestBody Account accountDetails) {

        Account account = accountRepository.findById(id).orElse(null);

        if (account == null) {
            return null;
        }

        account.setName(accountDetails.getName());
        account.setEmail(accountDetails.getEmail());
        account.setRole(accountDetails.getRole());
        account.setBranch(accountDetails.getBranch());

        return accountRepository.save(account);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable Long id) {

        if (!accountRepository.existsById(id)) {
            return "Account not found";
        }

        accountRepository.deleteById(id);
        return "Account deleted successfully";
    }
}