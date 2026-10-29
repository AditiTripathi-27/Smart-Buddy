
package smart_buddy_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SessionController {

    @GetMapping("/api/session/validate")
    public ResponseEntity<?> validateSession() {
        return ResponseEntity.ok(
                Map.of("valid", true)
        );
    }
}
