# Como contribuir

Este documento descreve o fluxo oficial para contribuir com código no Campus
Seguro, desde o fork até o merge na branch `main`.

## Regra de ouro

Não faça merge direto na `main` sem revisão. Somente o Gerente e a equipe de
Infra/DevOps revisam e fazem o merge dos Pull Requests.

## Fluxo com fork e Pull Request

### 1. Criar o fork

No GitHub, clique em **Fork** no repositório principal e crie uma cópia na sua
conta pessoal.

### 2. Clonar o fork

Substitua os endereços pelos repositórios reais da organização e da sua conta:

```bash
git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
cd NOME_DO_REPOSITORIO
```

### 3. Configurar os remotes

O remote `origin` aponta para o seu fork. Adicione o repositório da
organização como `upstream`:

```bash
git remote add upstream https://github.com/ORGANIZACAO/NOME_DO_REPOSITORIO.git
git remote -v
```

Antes de começar uma tarefa, atualize sua referência da `main`:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
```

Se a `main` local tiver alterações próprias, não force a atualização. Resolva
o estado da branch antes de criar uma nova branch.

### 4. Criar a branch da tarefa

`development` é a branch de integração do time. A `main` permanece protegida
e recebe somente mudanças já revisadas e validadas.

Use o padrão:

```text
feature/<prefixo>-000-descricao-curta
```

Exemplo:

```bash
git switch -c feature/api-123-validar-ocorrencia
```

O número ou identificador deve corresponder ao card do Trello quando houver
um card para a tarefa.

### 5. Desenvolver e testar

- Faça commits pequenos e objetivos.
- Não inclua senhas, tokens, arquivos `.env` ou a pasta `venv`.
- Teste localmente antes de abrir o Pull Request.
- Atualize a documentação quando o comportamento, configuração ou fluxo do
  projeto mudar.

Exemplo de commit:

```bash
git add arquivo-alterado.py DOCUMENTACAO_API.md
git commit -m "feat: validar dados da ocorrência"
```

### 6. Enviar para o fork

A maioria do time não possui permissão para fazer push no repositório da
organização:

```bash
git push -u origin feature/api-123-validar-ocorrencia
```

### 7. Abrir o Pull Request

No GitHub, abra um Pull Request:

```text
fork:feature/api-123-validar-ocorrencia
    -> organização:development
```

O Pull Request deve conter:

- resumo do que foi alterado;
- motivo da alteração;
- instruções para testar;
- riscos ou pontos de atenção;
- referência ao card do Trello;
- confirmação de que a documentação foi atualizada, quando aplicável.

### 8. Vincular o Trello

O card deve conter o link do Pull Request, e o Pull Request deve conter o link
ou identificador do card. Use uma referência clara, por exemplo:

```text
Trello: https://trello.com/c/ID_DO_CARD
```

Se o repositório estiver conectado ao Trello, a criação ou alteração do Pull
Request pode movimentar o card automaticamente. Essa automação depende da
integração GitHub/Trello ou de uma regra do Butler configurada pela
organização; ela não é criada apenas por este código-fonte. Até a confirmação
da integração, faça o vínculo manualmente e confira a coluna do card.

## Movimentação do card

| Situação | Movimento |
|---|---|
| A tarefa começou a ser implementada | `Backlog` → `Em Andamento` |
| O código está pronto e sendo validado localmente | `Em Andamento` → `Em testes` |
| O Pull Request foi aberto do fork para `development` | `Em testes` → `PR Aberto (Fork → Development)` |
| O Pull Request foi revisado e mergeado em `development` | `PR Aberto` → `✅ Aprovado/Merged na Development` |

Quando a automação estiver habilitada, confirme se o evento do GitHub moveu o
card corretamente. Se não moveu, atualize-o manualmente e registre a situação
no card.

## Antes de pedir revisão

- [ ] Testei localmente.
- [ ] O Pull Request está linkado no card do Trello.
- [ ] O Pull Request está apontando do fork para `development` do repositório principal.
- [ ] A descrição explica o que mudou e como testar.
- [ ] A branch está atualizada com a `main` atual.
- [ ] Não há conflitos com a `main`.
- [ ] Não há segredos, `.env`, `venv` ou arquivos gerados no commit.
- [ ] A documentação foi atualizada quando necessário.

## Promoção para `main`

Depois que as mudanças forem integradas e validadas em `development`, o
Gerente ou Infra/DevOps deve abrir ou aprovar o Pull Request:

```text
organização:development
    -> organização:main
```

Nenhum colaborador deve fazer merge direto na `main`. Depois do merge final:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git branch -d feature/api-123-validar-ocorrencia
```

O branch do fork também pode ser removido depois que o Pull Request for
mergeado, desde que não exista outro trabalho pendente nele.
