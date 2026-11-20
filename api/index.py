import sys
import os
import shutil
import traceback

# Add backend directory to Python sys.path so app.* imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# When executing in Vercel's serverless environment, ensure writable /tmp storage
if os.environ.get("VERCEL"):
    os.makedirs("/tmp/uploads", exist_ok=True)
    source_db = os.path.join(backend_dir, "dermalytics.db")
    target_db = "/tmp/dermalytics.db"
    if os.path.exists(source_db) and not os.path.exists(target_db):
        try:
            shutil.copy2(source_db, target_db)
        except Exception as e:
            print("DB copy error:", e)

try:
    from app.main import app
except Exception as e:
    err_tb = traceback.format_exc()
    print("FATAL ERROR IMPORTING APP IN VERCEL SERVERLESS FUNCTION:\n", err_tb)
    
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="Dermalytics Diagnostic Fallback")
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    async def vercel_diagnostic(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "FastAPI initialization failed on Vercel cold-start",
                "error": str(e),
                "traceback": err_tb,
                "environment": {
                    "current_dir": current_dir,
                    "backend_dir": backend_dir,
                    "backend_exists": os.path.exists(backend_dir),
                    "backend_contents": os.listdir(backend_dir) if os.path.exists(backend_dir) else [],
                    "sys_path": sys.path
                }
            }
        )
