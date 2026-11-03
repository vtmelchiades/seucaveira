# 该函数用于对外界提供retreive服务，调用的是Internet_model 中的接口
from typing import List
from model.Internet.Internet_model import INSTANCE
from langchain_core.documents import Document

def retrieve(query:str) ->List[Document]:
    if INSTANCE is None:
        # LAZY-GUARD: embedding model not available
        return []
    return INSTANCE.retriever.invoke(query)