# pdf-to-data

A Claude Code skill for extracting structured data from PDFs.

## Features

- **Text Extraction**: Get all text content with layout preservation
- **Table Detection**: Automatically detect and extract tabular data
- **Form Fields**: Extract fillable form field names and values
- **Multiple Output Formats**: JSON, CSV, or Excel (XLSX)
- **Page Selection**: Extract specific pages or entire documents

## Installation

### As a Claude Code Skill

Copy to your Claude skills directory:

```bash
cp -r pdf-to-data ~/.claude/skills/
```

### Dependencies

```bash
pip install pymupdf openpyxl
```

## Usage

In Claude Code, use the `/pdf-to-data` command:

```
/pdf-to-data invoice.pdf
/pdf-to-data report.pdf --format xlsx
/pdf-to-data forms.pdf --format csv --output data.csv
/pdf-to-data large-doc.pdf --page 3 --tables-only
```

### Direct Script Usage

```bash
python scripts/extract.py document.pdf
python scripts/extract.py report.pdf --format xlsx --output data.xlsx
python scripts/extract.py forms.pdf --format csv
```

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--format` | `-f` | Output format: `json`, `csv`, or `xlsx` |
| `--output` | `-o` | Output file path |
| `--tables-only` | `-t` | Extract only tables, skip text |
| `--page` | `-p` | Extract specific page (1-indexed) |

## Output Formats

### JSON (default)

```json
{
  "source": "document.pdf",
  "metadata": {
    "title": "Quarterly Report",
    "author": "Finance Team",
    "page_count": 12
  },
  "pages": [
    {
      "number": 1,
      "text": "Page content...",
      "tables": [
        [["Header1", "Header2"], ["row1", "row2"]]
      ]
    }
  ],
  "form_fields": [
    {
      "page": 1,
      "field_name": "name",
      "field_type": "Text",
      "field_value": "John Doe"
    }
  ]
}
```

### CSV

Tables are exported with headers, separated by blank lines.

### XLSX

Excel workbook with multiple sheets:
- **Text**: All text content by page
- **Table_N**: Each detected table
- **Form_Fields**: All form field data
- **Metadata**: Document metadata

## Requirements

- Python 3.8+
- PyMuPDF (`pip install pymupdf`)
- openpyxl (`pip install openpyxl`) - for XLSX output

## License

MIT
