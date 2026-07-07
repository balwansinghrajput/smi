from fastapi import APIRouter, Depends
from typing import List

from app.core.auth import require_roles
from app.core.database import get_database
from app.schemas.shipping import DeliveryMethodCreate, DeliveryMethodUpdate, DeliveryMethodResponse
from app.services.shipping_service import ShippingService

router = APIRouter(prefix="/shipping/methods", tags=["Shipping"])


def get_shipping_service(db=Depends(get_database)):
    return ShippingService(db)


@router.get("/", response_model=List[DeliveryMethodResponse], dependencies=[Depends(require_roles("super_admin", "admin"))])
async def list_methods(
    service: ShippingService = Depends(get_shipping_service),
):
    """Get all delivery methods (admin only)"""
    return await service.list_methods()


@router.post("/", response_model=DeliveryMethodResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def create_method(
    payload: DeliveryMethodCreate,
    service: ShippingService = Depends(get_shipping_service),
):
    """Create a new delivery method (max 2)"""
    return await service.create_method(payload)


@router.put("/{method_id}", response_model=DeliveryMethodResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def update_method(
    method_id: str,
    payload: DeliveryMethodUpdate,
    service: ShippingService = Depends(get_shipping_service),
):
    """Update a delivery method"""
    return await service.update_method(method_id, payload)


@router.patch("/{method_id}/toggle", response_model=DeliveryMethodResponse, dependencies=[Depends(require_roles("super_admin", "admin"))])
async def toggle_method(
    method_id: str,
    service: ShippingService = Depends(get_shipping_service),
):
    """Toggle a delivery method's active status"""
    return await service.toggle_method(method_id)


@router.delete("/{method_id}", dependencies=[Depends(require_roles("super_admin", "admin"))])
async def delete_method(
    method_id: str,
    service: ShippingService = Depends(get_shipping_service),
):
    """Delete a delivery method"""
    await service.delete_method(method_id)
    return {"message": "Delivery method deleted successfully"}
