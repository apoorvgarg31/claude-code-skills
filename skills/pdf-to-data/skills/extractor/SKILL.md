---
name: pdf-to-data
description: Extract structured data from PDFs to JSON, CSV, or Excel
argument-hint: <pdf-file> [--format json|csv|xlsx] [--output <file>]
user-invocable: true
allowed-tools: Read, Write, Bash
---

# PDF to Data Extractor

Extract tables, text, and form fields from PDFs into structured formats.

## Usage

```
/pdf-to-data invoice.pdf
/pdf-to-data report.pdf --format xlsx
/pdf-to-data forms.pdf --format csv --output data.csv
```

## Arguments

- `$0` - Path to PDF file (required)
- `--format` - Output format: `json` (default), `csv`, `xlsx`
- `--output` - Output file path (optional, defaults to stdout for json/csv)
- `--tables-only` - Extract only tables, skip general text
- `--page` - Extract specific page number (1-indexed)

## How It Works

1. **Text Extraction:** Extracts all text content with layout preservation
2. **Table Detection:** Uses PyMuPDF's table detection to find and extract tabular data
3. **Form Fields:** Extracts form field names and values from fillable PDFs
4. **Metadata:** Includes document metadata (title, author, creation date)

## Requirements

Ensure PyMuPDF is installed:

```bash
pip install pymupdf openpyxl
```

## Running the Extraction

```bash
python ~/.claude/skills/pdf-to-data/scripts/extract.py "$0" $ARGUMENTS
```

Or if running from the project directory:

```bash
python ./scripts/extract.py "$0" $ARGUMENTS
```

## Output Formats

### JSON (default)
```json
{
  "metadata": { "title": "...", "pages": 5 },
  "pages": [
    {
      "number": 1,
      "text": "...",
      "tables": [[["Header1", "Header2"], ["row1col1", "row1col2"]]],
      "form_fields": [{"name": "field1", "value": "..."}]
    }
  ]
}
```

### CSV
Exports all tables as CSV. Multiple tables are separated by blank lines.

### XLSX
Creates an Excel workbook with:
- Sheet "Text" - Full text content per page
- Sheet "Table_1", "Table_2", etc. - Each detected table
- Sheet "Form_Fields" - All form field data

## Examples

**Basic extraction:**
```
/pdf-to-data quarterly-report.pdf
```

**Export tables to Excel:**
```
/pdf-to-data financial-data.pdf --format xlsx --output financials.xlsx
```

**Extract specific page as CSV:**
```
/pdf-to-data large-doc.pdf --page 3 --tables-only --format csv
```

## Error Handling

- If PDF is encrypted, the script will report the error
- If no tables found, returns empty `tables` array
- Invalid page numbers are handled gracefully
