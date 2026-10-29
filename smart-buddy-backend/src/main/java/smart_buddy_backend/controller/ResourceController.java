package smart_buddy_backend.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import smart_buddy_backend.repository.ResourceRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    private final Path uploadDir =
            Paths.get("uploads").toAbsolutePath().normalize();

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // Existing link sharing
    @PostMapping
    public smart_buddy_backend.entity.Resource addResource(
            @RequestBody smart_buddy_backend.entity.Resource resource) {

        validate(resource.getTitle(), resource.getBranch(),
                resource.getDivision(), resource.getSubject());

        return resourceRepository.save(resource);
    }

    // Upload a file and save its details in MySQL
    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public smart_buddy_backend.entity.Resource uploadResource(
            @RequestParam String title,
            @RequestParam String subject,
            @RequestParam String branch,
            @RequestParam String division,
            @RequestParam String resourceType,
            @RequestParam String uploadedBy,
            @RequestParam("file") MultipartFile file) {

        validate(title, branch, division, subject);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a file");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null ||
                !originalName.matches("(?i)^.*\\.(pdf|doc|docx|ppt|pptx|txt|png|jpg|jpeg)$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "File type not allowed");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum file size is 10 MB");
        }

        try {
            Files.createDirectories(uploadDir);

            String extension = originalName.substring(
                    originalName.lastIndexOf("."));

            String fileName = UUID.randomUUID() + extension;
            Path destination = uploadDir.resolve(fileName).normalize();

            if (!destination.startsWith(uploadDir)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid filename");
            }

            file.transferTo(destination);

            smart_buddy_backend.entity.Resource resource =
                    new smart_buddy_backend.entity.Resource();

            resource.setTitle(title);
            resource.setSubject(subject);
            resource.setBranch(branch);
            resource.setDivision(division);
            resource.setResourceType(resourceType);
            resource.setUploadedBy(uploadedBy);
            resource.setResourceUrl("/api/resources/files/" + fileName);

            return resourceRepository.save(resource);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "File could not be saved");
        }
    }

    // Serve uploaded files
    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String fileName) {

        if (!fileName.matches(
                "^[a-fA-F0-9-]{36}\\.(pdf|doc|docx|ppt|pptx|txt|png|jpg|jpeg)$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid filename");
        }

        Path filePath = uploadDir.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadDir) ||
                !Files.isRegularFile(filePath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "File not found");
        }


Resource file = new FileSystemResource(filePath);

MediaType contentType;

try {
    String detectedType = Files.probeContentType(filePath);

    contentType = detectedType != null
            ? MediaType.parseMediaType(detectedType)
            : MediaType.APPLICATION_OCTET_STREAM;

} catch (IOException e) {
    contentType = MediaType.APPLICATION_OCTET_STREAM;
}

return ResponseEntity.ok()
        .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" + fileName + "\""
        )
        .contentType(contentType)
        .body(file);

    }

    @GetMapping
    public List<smart_buddy_backend.entity.Resource> getResources(
            @RequestParam String branch,
            @RequestParam String division,
            @RequestParam String subject) {

        return resourceRepository.findByBranchAndDivisionAndSubject(
                branch, division, subject);
    }

    @GetMapping("/all")
    public List<smart_buddy_backend.entity.Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Resource not found");
        }

        resourceRepository.deleteById(id);
    }

    private void validate(
            String title, String branch, String division, String subject) {

        if (title == null || title.isBlank()
                || branch == null || branch.isBlank()
                || division == null || division.isBlank()
                || subject == null || subject.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title, branch, division and subject are required");
        }
    }
}
