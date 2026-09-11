from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def ok(data, message: str = "Operation successful", status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": jsonable_encoder(data), "message": message},
    )


def fail(code: str, message: str, status_code: int = 400):
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "error": {"code": code, "message": message}},
    )
