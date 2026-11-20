import sys
import os
import shutil

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
        except Exception:
            pass

from app.main import app
