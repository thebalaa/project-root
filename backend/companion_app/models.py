from pydantic import BaseModel, Field
from typing import List

class Entity(BaseModel):
    name: str = Field(..., description="Name of the entity")
    description: str = Field(..., description="Description of the entity")

class Relationship(BaseModel):
    entity1: Entity = Field(..., description="First entity in the relationship")
    entity2: Entity = Field(..., description="Second entity in the relationship")
    description: str = Field(..., description="Description of how the entities are related")
    relation_type: str = Field(..., description="Type of relationship between the entities")

class KnowledgeGraph(BaseModel):
    entities: List[Entity] = Field(..., description="List of entities in the knowledge graph")
    relationships: List[Relationship] = Field(..., description="List of relationships between entities") 