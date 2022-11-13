from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from pydantic import BaseModel

from app.models.category import Category
from app.schemas.request_params import Pagination


class CreateProduct(BaseModel):
    title: str
    brand: str
    product_detail: str
    images: List[str]
    price: int
    category_id: UUID
    condition: str

    class Config:
        orm_mode = True


class UpdateStock(BaseModel):
    size: str
    quantity: int

    class Config:
        orm_mode = True


class UpdateProduct(BaseModel):
    id: UUID
    title: str
    brand: str
    product_detail: str
    images: List[str]
    price: int
    category_id: UUID
    condition: str
    stock: List[UpdateStock]

    class Config:
        orm_mode = True


class Stock(BaseModel):
    size: str
    quantity: int

    class Config:
        orm_mode = True


class GetProduct(BaseModel):
    id: UUID
    title: str
    brand: str
    product_detail: str
    images: List[str]
    price: int
    category_id: UUID
    category_name: str
    condition: str
    size: Optional[List[str]]
    stock: Optional[List[Stock]]

    class Config:
        orm_mode = True


class Product(BaseModel):
    id: UUID
    title: str
    brand: str
    product_detail: str
    price: int
    category_id: UUID
    condition: str
    images: List[str]

    class Config:
        orm_mode = True


class GetProducts(BaseModel):
    data: List[Product]
    total_rows: int
    pagination: Pagination

    class Config:
        orm_mode = True


class SearchImageRequest(BaseModel):
    image: str

    class Config:
        orm_mode = True
