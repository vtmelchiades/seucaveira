# Cyber Doctor (赛博华佗) — instalação local neste repositório

[Código original](https://github.com/ZeroTang05/cyber-doctor) (GPLv3) copiado para
`cyber-doctor/` neste repositório, com um ambiente Python já pronto em `.venv/`.

## O que já está feito

| Item | Status |
| --- | --- |
| Código-fonte em `cyber-doctor/` | ✅ (clone `main`, commit `d2dd8ae`) |
| Ambiente virtual em `.venv/` (Python 3.11) | ✅ |
| Dependências instaladas (versões fixadas em `cyber-doctor/requirements-local.txt`) | ✅ |
| `.env` criado (copiado de `.env.example`) | ✅ — **falta preencher as chaves de API** |
| `config/config-web.yaml` ajustado (`model-path` aponta para `.cache/modelscope/hub/`) | ✅ |
| App sobe e serve a interface Gradio | ✅ (testado) |

## 1. Subir o app

```bash
cd cyber-doctor
../.venv/bin/python launch.py          # http://localhost:7860
# ou em outra porta:
PORT=8080 ../.venv/bin/python launch.py
```

`launch.py` é um wrapper pequeno que faz o mesmo que `python app.py`, mas com
`server_name="0.0.0.0"` e porta configurável (necessário em container/preview).

## 2. Configurar o modelo de linguagem (obrigatório para o chat funcionar)

Edite `cyber-doctor/.env`:

```dotenv
LLM_BASE_URL = https://open.bigmodel.cn/api/paas/v4   # ou deepseek, qwen, siliconflow, ollama...
LLM_API_KEY  = <sua chave>
MODEL_NAME   = glm-4-flash
```

Opções de provedores (qualquer endpoint compatível com o SDK da OpenAI):
智谱AI/BigModel, DeepSeek, Qwen/DashScope, SiliconFlow, Volcengine Ark, ou um
Ollama local (`http://127.0.0.1:11434/v1`).

Chaves opcionais (cada recurso fica desabilitado, sem derrubar o app, se faltar):

- `IMAGE_GENERATE_API` / `IMAGE_GENERATE_MODEL` — geração de imagem (ZhipuAI)
- `IMAGE_DESCRIBE_API` / `IMAGE_DESCRIBE_MODEL` — leitura de imagem/laudo
- `VIDEO_GENERATE_API` / `VIDEO_GENERATE_MODEL` — geração de vídeo (ZhipuAI)
- `YOUCOM_API_KEY` — busca na internet / DeepResearch

## 3. Recursos opcionais / limitações deste ambiente

- **RAG de base de conhecimento e RAG de busca na internet**: dependem do modelo
  de embedding `iic/nlp_corom_sentence-embedding_chinese-base` (ModelScope) e de
  `torch`. Neste sandbox o acesso a `modelscope.cn` é bloqueado e não há
  `torch`, então esses dois recursos ficam desativados (retornam vazio em vez de
  quebrar o app). Para habilitar:
  ```bash
  .venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
  # depois rode com rede liberada para modelscope.cn (download automático do modelo)
  ```
- **Entrada de voz (whisper)**: precisa de `torch` + `openai-whisper`. Sem isso,
  o modo de voz não funciona (`pip install openai-whisper==20240930`).
- **Base de conhecimento**: coloque arquivos em `cyber-doctor/konwledge-base/`
  (grafia do projeto).
- **Grafo de conhecimento (Neo4j)**: configure `config/config-web.yaml`
  (`database.neo4j.password`) e suba o Neo4j. Sem isso, só o RAG de grafo fica off.

## 4. Patches aplicados ao código original

O código upstream presumia que toda chave/config existisse, o que fazia
`python app.py` abortar com `ZhipuAIError` / `ImportError` antes de abrir a UI.
As mudanças mínimas (marcadas com `LAZY-GUARD` no código) são:

1. `client/zhipuAPI/client.py` — os 3 clientes ZhipuAI só são criados se houver
   chave; senão ficam `None`.
2. `qa/function_tool.py` — as funções de imagem/vídeo devolvem uma mensagem
   amigável ("configure X no .env") em vez de estourar `AttributeError`.
3. `model/RAG/retrieve_model.py` + `model/RAG/retrieve_service.py` e
   `model/Internet/Internet_model.py` + `model/Internet/Internet_service.py` —
   instanciação lazy do modelo de embedding; se indisponível, a busca retorna
   `[]`.

Para voltar ao upstream puro:
```bash
cd cyber-doctor && curl -sL https://github.com/ZeroTang05/cyber-doctor/archive/refs/heads/main.tar.gz | tar xz --strip-components=1
```

## 5. Aviso

Projeto de pesquisa/estudo (东南大学暑期实训). Não use como diagnóstico médico
real — as respostas do modelo não substituem avaliação profissional.
