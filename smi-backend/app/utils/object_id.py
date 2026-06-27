from bson import ObjectId
from bson.errors import InvalidId


def validate_object_id(value: str, field_name: str = "id") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise ValueError(f"Invalid {field_name}") from exc


def stringify_id(document: dict | None) -> dict | None:
    if not document:
        return document
    document = dict(document)
    if "_id" in document:
        document["id"] = str(document["_id"])
        document["_id"] = str(document["_id"])
    return document

