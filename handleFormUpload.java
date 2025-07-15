@PostMapping(value = "/{targetSystemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Response> handleFormUpload(
        @RequestParam("file") MultipartFile file,
        @PathVariable("targetSystemId") Integer targetSystemId
) {
    try {
        LOGGER.info("UploadExcel called with targetSystemId: {}", targetSystemId);

        // NEW: Capture validation messages from the service
        List<String> validationErrors = service.headExcelAndCollectErrors(file, targetSystemId);

        if (!validationErrors.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(new Response(false, "Validation failed", validationErrors));
        }

        return ResponseEntity.ok(
                new Response(true, "Data created/updated successfully")
        );

    } catch (Exception e) {
        LOGGER.error("Unexpected error occurred: ", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new Response(false, "Unexpected error: " + e.getMessage()));
    }
}


public List<String> headExcelAndCollectErrors(MultipartFile file, Integer targetSystemId)
        throws IOException {
    List<String> errors = new ArrayList<>();
    XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream());
    XSSFSheet sheet = workbook.getSheetAt(0);

    for (int rowIndex = 1; rowIndex < sheet.getPhysicalNumberOfRows(); rowIndex++) {
        XSSFRow row = sheet.getRow(rowIndex);

        if (row == null) {
            errors.add("Row " + (rowIndex + 1) + " is empty");
            continue;
        }

        Cell feedNameCell = row.getCell(0);
        if (feedNameCell == null || feedNameCell.getCellType() == CellType.BLANK) {
            errors.add("Row " + (rowIndex + 1) + ", Column 1 (Feed Name) is missing");
        }

        Cell indicatorCell = row.getCell(1);
        if (indicatorCell == null || indicatorCell.getCellType() == CellType.BLANK) {
            errors.add("Row " + (rowIndex + 1) + ", Column 2 (Indicator) is missing");
        }

        // Add more validations for other columns as needed...
    }

    return errors;
}
