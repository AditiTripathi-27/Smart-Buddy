
package smart_buddy_backend.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import smart_buddy_backend.entity.AttendanceSheet;
import smart_buddy_backend.model.Account;
import smart_buddy_backend.repository.AccountRepository;
import smart_buddy_backend.repository.AttendanceSheetRepository;

@RestController
@RequestMapping("/api/attendance-sheets")
public class AttendanceSheetController {

    private final AttendanceSheetRepository repository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;

    public AttendanceSheetController(
            AttendanceSheetRepository repository,
            AccountRepository accountRepository,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.accountRepository = accountRepository;
        this.objectMapper = objectMapper;
    }

    private Account getLoggedInAccount(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        return accountRepository
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    private boolean isRole(Account account, String role) {
        return account != null
                && account.getRole() != null
                && account.getRole().equalsIgnoreCase(role);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSheet(
            Authentication authentication,
            @RequestParam("subject") String subject,
            @RequestParam("branch") String branch,
            @RequestParam("division") String division,
            @RequestParam("attendanceType") String attendanceType,
            @RequestParam("file") MultipartFile file) {

        Account account = getLoggedInAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Faculty")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only faculty can upload attendance.");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Please select a file.");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body("File size must not exceed 10 MB.");
        }

        if (subject.isBlank() || branch.isBlank()
                || division.isBlank() || attendanceType.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Subject, branch, division and attendance type are required.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid file name.");
        }

        String lowerName = fileName.toLowerCase(Locale.ROOT);

        boolean isCsv = lowerName.endsWith(".csv");
        boolean isExcel = lowerName.endsWith(".xlsx")
                || lowerName.endsWith(".xls");

        if (!isCsv && !isExcel) {
            return ResponseEntity.badRequest()
                    .body("Upload only CSV, XLS or XLSX files.");
        }

        try {
            List<String> headers;
            List<List<String>> rows;

            if (isCsv) {
                List<List<String>> csvData = readCsv(file);

                if (csvData.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body("The CSV file is empty.");
                }

                headers = csvData.get(0);
                rows = csvData.subList(1, csvData.size());
            } else {
                List<List<String>> excelData = readExcel(file);

                if (excelData.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body("The Excel file is empty.");
                }

                headers = excelData.get(0);
                rows = excelData.subList(1, excelData.size());
            }

            if (headers.isEmpty()
                    || headers.stream().allMatch(String::isBlank)) {
                return ResponseEntity.badRequest()
                        .body("The first row must contain column headings.");
            }

            AttendanceSheet sheet = new AttendanceSheet();
            sheet.setSubject(subject.trim());
            sheet.setBranch(branch.trim());
            sheet.setDivision(division.trim());
            sheet.setAttendanceType(attendanceType.trim());
            sheet.setFileName(fileName);
            sheet.setFileData(file.getBytes());
            sheet.setHeadersJson(objectMapper.writeValueAsString(headers));
            sheet.setRowsJson(objectMapper.writeValueAsString(rows));

            AttendanceSheet saved = repository.save(sheet);

            return ResponseEntity.ok(toResponse(saved));

        } catch (Exception exception) {
            return ResponseEntity.badRequest()
                    .body("Could not read the file. Check that it is a valid CSV or Excel file.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAttendanceSheets(
            Authentication authentication) {

        Account account = getLoggedInAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        List<AttendanceSheet> sheets;

        if (isRole(account, "Student")) {

            if (account.getBranch() == null
                    || account.getDivision() == null) {
                return ResponseEntity.ok(List.of());
            }

            sheets = repository.findByBranchAndDivisionOrderByUploadedAtDesc(
                    account.getBranch(),
                    account.getDivision());

        } else if (isRole(account, "Faculty")) {

            if (account.getBranch() == null) {
                return ResponseEntity.ok(List.of());
            }

            sheets = repository.findAll()
                    .stream()
                    .filter(sheet -> account.getBranch()
                            .equalsIgnoreCase(sheet.getBranch()))
                    .collect(Collectors.toList());

        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied.");
        }

        List<Map<String, Object>> result = new ArrayList<>();

        try {
            for (AttendanceSheet sheet : sheets) {
                result.add(toResponse(sheet));
            }
        } catch (IOException exception) {
            return ResponseEntity.internalServerError()
                    .body("Could not read saved attendance data.");
        }

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> toResponse(
            AttendanceSheet sheet) throws IOException {

        Map<String, Object> data = new LinkedHashMap<>();

        data.put("id", sheet.getId());
        data.put("subject", sheet.getSubject());
        data.put("branch", sheet.getBranch());
        data.put("division", sheet.getDivision());
        data.put("attendanceType", sheet.getAttendanceType());
        data.put("fileName", sheet.getFileName());
        data.put("uploadedAt", sheet.getUploadedAt());

        List<String> headers = objectMapper.readValue(
                sheet.getHeadersJson(),
                new TypeReference<List<String>>() {
                });

        List<List<String>> rows = objectMapper.readValue(
                sheet.getRowsJson(),
                new TypeReference<List<List<String>>>() {
                });

        data.put("headers", headers);
        data.put("rows", rows);

        return data;
    }

    private List<List<String>> readExcel(
            MultipartFile file) throws IOException {

        List<List<String>> data = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(
                file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                List<String> cells = new ArrayList<>();

                for (int column = 0; column < row.getLastCellNum(); column++) {

                    String value = formatter.formatCellValue(
                            row.getCell(column));

                    cells.add(value);
                }

                if (cells.stream().anyMatch(value -> !value.isBlank())) {
                    data.add(cells);
                }
            }
        }

        return data;
    }

    private List<List<String>> readCsv(
            MultipartFile file) throws IOException {

        List<List<String>> data = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        file.getInputStream(),
                        StandardCharsets.UTF_8))) {

            String line;

            while ((line = reader.readLine()) != null) {
                List<String> cells = new ArrayList<>();
                StringBuilder cell = new StringBuilder();
                boolean insideQuotes = false;

                for (int i = 0; i < line.length(); i++) {
                    char character = line.charAt(i);

                    if (character == '"') {
                        if (insideQuotes
                                && i + 1 < line.length()
                                && line.charAt(i + 1) == '"') {
                            cell.append('"');
                            i++;
                        } else {
                            insideQuotes = !insideQuotes;
                        }
                    } else if (character == ',' && !insideQuotes) {
                        cells.add(cell.toString().trim());
                        cell.setLength(0);
                    } else {
                        cell.append(character);
                    }
                }

                cells.add(cell.toString().trim());

                if (cells.stream().anyMatch(value -> !value.isBlank())) {
                    data.add(cells);
                }
            }
        }

        return data;
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadSheet(
            Authentication authentication,
            @PathVariable Long id) {

        Account account = getLoggedInAccount(authentication);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in again.");
        }

        if (!isRole(account, "Student")
                && !isRole(account, "Faculty")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied.");
        }

        return repository.findById(id)
                .filter(sheet -> account.getBranch() != null
                        && account.getBranch().equalsIgnoreCase(
                                sheet.getBranch()))
                .filter(sheet -> isRole(account, "Faculty")
                        || (account.getDivision() != null
                                && account.getDivision().equalsIgnoreCase(
                                        sheet.getDivision())))
                .<ResponseEntity<?>>map(sheet -> ResponseEntity.ok()
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\""
                                        + sheet.getFileName()
                                                .replace("\"", "")
                                        + "\"")
                        .contentType(
                                MediaType.APPLICATION_OCTET_STREAM)
                        .body(sheet.getFileData()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
