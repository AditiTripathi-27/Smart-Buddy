
package smart_buddy_backend.controller;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import smart_buddy_backend.entity.Timetable;
import smart_buddy_backend.model.Account;
import smart_buddy_backend.repository.AccountRepository;
import smart_buddy_backend.repository.TimetableRepository;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {

    private final TimetableRepository repository;
    private final AccountRepository accountRepository;

    public TimetableController(
            TimetableRepository repository,
            AccountRepository accountRepository) {
        this.repository = repository;
        this.accountRepository = accountRepository;
    }

    private Account getAccount(Authentication authentication) {
        if (authentication == null) return null;

        return accountRepository
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    private boolean isRole(Account account, String role) {
        return account != null
                && account.getRole() != null
                && account.getRole().equalsIgnoreCase(role);
    }

    private boolean hasBranch(Account account, Timetable timetable) {
        return account.getBranch() != null
                && timetable.getBranch() != null
                && account.getBranch().equalsIgnoreCase(
                        timetable.getBranch());
    }

    private boolean canAccess(Account account, Timetable timetable) {
        if (!hasBranch(account, timetable)) return false;

        if (isRole(account, "Faculty")) return true;

        return isRole(account, "Student")
                && account.getDivision() != null
                && timetable.getDivision() != null
                && account.getDivision().equalsIgnoreCase(
                        timetable.getDivision());
    }

    private Map<String, Object> toResponse(Timetable timetable) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", timetable.getId());
        data.put("branch", timetable.getBranch());
        data.put("division", timetable.getDivision());
        data.put("fileName", timetable.getFileName());
        data.put("uploadedAt", timetable.getUploadedAt());
        return data;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadTimetable(
            Authentication authentication,
            @RequestParam("branch") String branch,
            @RequestParam("division") String division,
            @RequestParam("file") MultipartFile file) {

        Account account = getAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Faculty")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only faculty can upload timetables.");
        }

        if (account.getBranch() == null
                || !account.getBranch().equalsIgnoreCase(branch.trim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can upload only for your own branch.");
        }

        if (division.isBlank() || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Select a division and a file.");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body("File size must not exceed 10 MB.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()
                || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest()
                    .body("Invalid file name.");
        }

        String lowerName = fileName.toLowerCase(Locale.ROOT);
        boolean allowed = lowerName.endsWith(".pdf")
                || lowerName.endsWith(".jpg")
                || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".png")
                || lowerName.endsWith(".doc")
                || lowerName.endsWith(".docx")
                || lowerName.endsWith(".ppt")
                || lowerName.endsWith(".pptx");

        if (!allowed) {
            return ResponseEntity.badRequest().body(
                    "Upload PDF, JPG, JPEG, PNG, DOC, DOCX, PPT or PPTX.");
        }

        try {
            Timetable timetable = new Timetable();
            timetable.setBranch(branch.trim());
            timetable.setDivision(division.trim());
            timetable.setFileName(fileName);
            timetable.setFileData(file.getBytes());

            return ResponseEntity.ok(
                    toResponse(repository.save(timetable)));

        } catch (IOException exception) {
            return ResponseEntity.badRequest()
                    .body("Could not read the uploaded file.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getTimetables(
            Authentication authentication) {

        Account account = getAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Faculty")
                && !isRole(account, "Student")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied.");
        }

        if (account.getBranch() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Timetable> timetables = repository.findAll()
                .stream()
                .filter(t -> canAccess(account, t))
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                timetables.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadTimetable(
            Authentication authentication,
            @PathVariable Long id) {

        Account account = getAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Faculty")
                && !isRole(account, "Student")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return repository.findById(id)
                .filter(t -> canAccess(account, t))
                .<ResponseEntity<?>>map(t -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\""
                                        + t.getFileName().replace("\"", "")
                                        + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(t.getFileData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<?> previewTimetable(
            Authentication authentication,
            @PathVariable Long id) {

        Account account = getAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        return repository.findById(id)
                .filter(t -> canAccess(account, t))
                .<ResponseEntity<?>>map(t -> {
                    String name = t.getFileName()
                            .toLowerCase(Locale.ROOT);

                    MediaType type;
                    if (name.endsWith(".pdf")) {
                        type = MediaType.APPLICATION_PDF;
                    } else if (name.endsWith(".jpg")
                            || name.endsWith(".jpeg")) {
                        type = MediaType.IMAGE_JPEG;
                    } else if (name.endsWith(".png")) {
                        type = MediaType.IMAGE_PNG;
                    } else {
                        return ResponseEntity.badRequest()
                                .body("Preview is available for PDF and images only.");
                    }

                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "inline; filename=\""
                                            + t.getFileName().replace("\"", "")
                                            + "\"")
                            .contentType(type)
                            .body(t.getFileData());
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimetable(
            Authentication authentication,
            @PathVariable Long id) {

        Account account = getAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Faculty")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only faculty can delete timetables.");
        }

        return repository.findById(id)
                .filter(t -> hasBranch(account, t))
                .<ResponseEntity<?>>map(t -> {
                    repository.delete(t);
                    return ResponseEntity.ok("Timetable deleted successfully.");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
