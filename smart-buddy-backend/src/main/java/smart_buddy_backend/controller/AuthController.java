package smart_buddy_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import smart_buddy_backend.model.Account;
import smart_buddy_backend.repository.AccountRepository;
import smart_buddy_backend.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final AccountRepository accountRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        public AuthController(AccountRepository accountRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil) {
                this.accountRepository = accountRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody Account account) {

                // Check if email already exists
                if (accountRepository.findByEmail(account.getEmail()).isPresent()) {
                        return ResponseEntity
                                        .status(HttpStatus.CONFLICT)
                                        .body("Email already registered");
                }

                // Encrypt password before saving
                account.setPassword(
                                passwordEncoder.encode(account.getPassword()));

                if ("Student".equalsIgnoreCase(account.getRole())
                                && (account.getDivision() == null
                                                || account.getDivision().isBlank())) {
                        return ResponseEntity.badRequest()
                                        .body("Please select a division");
                }

                accountRepository.save(account);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body("Registration successful");
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody Account account) {

                Account existingAccount = accountRepository.findByEmail(account.getEmail()).orElse(null);

                if (existingAccount == null) {
                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body("Invalid email or password");
                }

                if (!passwordEncoder.matches(
                                account.getPassword(),
                                existingAccount.getPassword())) {

                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body("Invalid email or password");
                }

                // Check selected role
                if (account.getRole() == null ||
                                !existingAccount.getRole().equalsIgnoreCase(account.getRole())) {

                        return ResponseEntity
                                        .status(HttpStatus.FORBIDDEN)
                                        .body("Role does not match this account");
                }

                String token = jwtUtil.generateToken(existingAccount.getEmail());

                java.util.Map<String, Object> response = new java.util.HashMap<>();

                response.put("token", token);
                response.put("id", existingAccount.getId());
                response.put("name", existingAccount.getName());
                response.put("email", existingAccount.getEmail());
                response.put("role", existingAccount.getRole());
                response.put("branch", existingAccount.getBranch());
                response.put("division", existingAccount.getDivision());

                return ResponseEntity.ok(response);

        }

}