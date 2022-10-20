from typing import List
from uuid import UUID

from pydantic import BaseModel


class Category(BaseModel):
    id: UUID
    title: str

    class Config:
        orm_mode = True


class GetCategory(BaseModel):
    data: List[Category]

    class Config:
        orm_mode = True
