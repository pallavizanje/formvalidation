@RestController
@RequestMapping("/api/excel")
public class ExcelUploadController {

    @PostMapping("/upload")
    public ResponseEntity<DQFrameworkUpdateResponse> upload(@RequestBody MultipartFile file) {

        // prepare the wrapper we always return
        DQFrameworkUpdateResponse resp = new DQFrameworkUpdateResponse();

        try {
            excelService.process(file);                 // <- your business logic
            resp.setSuccess(true);
            resp.setMessage("Data created/updated successfully");

            return ResponseEntity.ok(resp);            // HTTP 200
        }
        catch (IllegalStateException | IOException ex) { // fine‑grained catch if you want
            resp.setSuccess(false);
            resp.setMessage(ex.getMessage());          // bubble up *just* the message

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)    // 400 or 422 if validation‑type errors
                    .body(resp);
        }
        catch (Exception ex) {                         // fallback for anything unexpected
            resp.setSuccess(false);
            resp.setMessage("Internal error: " + ex.getMessage());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
                    .body(resp);
        }
    }
}
