import pdfplumber
import sys
import json
import io
import os

# Set stdout to UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def extract_text_from_pdf(pdf_path):
    try:
        filename = os.path.basename(pdf_path)
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    # Clean the text to remove problematic characters
                    cleaned_text = text.encode('utf-8', errors='ignore').decode('utf-8')
                    full_text += cleaned_text + "\n\n"
            return {"status": "success", "text": full_text, "page":page, "filename":filename}
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            pdf_path = sys.argv[1]
            result = extract_text_from_pdf(pdf_path)
            # Only output the JSON, no debug messages
            print(json.dumps(result, ensure_ascii=False))
        else:
            error_result = {"status": "error", "error": "No PDF path provided"}
            print(json.dumps(error_result))
    except Exception as e:
        error_result = {"status": "error", "error": f"Script error: {str(e)}"}
        print(json.dumps(error_result)) 