# ETL Pipeline

## Overview

The ETL (Extract, Transform, Load) pipeline allows importing AI model benchmark data from Excel/CSV files into the Supabase database.

## Installation

Install Python dependencies:
```bash
pip install pandas openpyxl supabase python-dotenv
```

## Usage

### Running the ETL Pipeline

```bash
python etl/main.py --input data/models.xlsx
```

### Supported Formats

- Excel files (.xlsx, .xls)
- CSV files (.csv)

### Data Format

#### Excel Template

The Excel file should have the following structure:

**Sheet: Models**
| name | organization | category | parameters | release_date | description | github_url | huggingface_url |
|------|--------------|----------|------------|--------------|-------------|------------|-----------------|
| GPT-4 | OpenAI | LLM | 1760000000000 | 2023-03-14 | Most capable GPT-4 model | https://github.com/openai | https://huggingface.co/openai/gpt-4 |

**Sheet: Benchmarks**
| name | description | type | unit |
|------|-------------|------|------|
| MMLU | Massive Multitask Language Understanding | knowledge | accuracy |

**Sheet: Results**
| model_name | benchmark_name | score | date_recorded | source |
|------------|----------------|-------|---------------|--------|
| GPT-4 | MMLU | 86.4 | 2024-01-01 | OpenAI |

### Data Validation

The pipeline validates:
- Required fields presence
- Data type correctness
- Foreign key references
- Duplicate entries

### Error Handling

Errors are logged to `etl/logs/etl.log`

## Development

### Adding New Data Sources

To add support for new data sources, create a new extractor in `etl/extract.py`:

```python
def extract_custom_format(file_path: str) -> pd.DataFrame:
    # Your extraction logic
    return df
```

### Adding New Transformations

Add transformations in `etl/transform.py`:

```python
def transform_custom_data(df: pd.DataFrame) -> pd.DataFrame:
    # Your transformation logic
    return df
```

## Testing

Run ETL tests:
```bash
pytest etl/tests/
```
