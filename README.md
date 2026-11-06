# Visualizador de itinerários do Transcol GV

Visualizador web estático dos itinerários do Transcol GV (CETURB/ES). A versão em desenvolvimento fica em `v1/`.

## Desenvolvimento local

Módulos ES não carregam por `file://`; use um servidor local na raiz do repositório:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/v1/
```

## Testes

```bash
npm test   # node --test, sem dependências
```
