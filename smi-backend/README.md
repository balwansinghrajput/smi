# SMI Backend

FastAPI + MongoDB backend for the SMI ecommerce frontend.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Swagger docs are available at `http://127.0.0.1:8001/docs`.

## Notes

- Products are read-only and loaded from the existing MongoDB `products` collection.
- Product listing returns four products per page.
- Auth uses JWT bearer tokens.
- Online payments use an extendable mock provider placeholder; COD orders are accepted immediately.
