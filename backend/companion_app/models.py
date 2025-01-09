from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class Entity(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    urls: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict] = Field(default_factory=dict)

class Relationship(BaseModel):
    source: str
    target: str
    relation_type: str
    description: Optional[str] = None
    urls: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict] = Field(default_factory=dict)
    entity1: Optional[str] = None
    entity2: Optional[str] = None

class KnowledgeGraph(BaseModel):
    entities: List[Entity] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)

class KnowledgeGraphResponse(BaseModel):
    url: str
    knowledge_graph: KnowledgeGraph
    metadata: Dict = Field(default_factory=dict)
    extraction_timestamp: str
    source_authority: float
    context: Optional[Dict] = Field(default_factory=dict) 