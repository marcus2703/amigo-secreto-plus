# Amigo Secreto - Sistema de Sorteio

## Descrição

Sistema para organização e sorteio de amigos secretos com envio automático de emails. Permite criar listas de participantes, realizar sorteios e notificar cada pessoa sobre seu amigo secreto.

## Estrutura do Projeto

```
amigo-secreto/
│
├── index.html              # Interface principal da aplicação
├── package.json            # Configurações do projeto
│
└── src/
    └── assets/
        ├── styles/         # Folhas de estilo CSS
        │   ├── reset.css
        │   └── main-content.css
        │
        ├── images/         # Imagens e recursos visuais
        │   └── logo.png
        │
        └── scripts/
            │
            ├── frontend.js           # Ponto de entrada da aplicação frontend
            ├── server.js             # Servidor Node.js/Express
            │
            └── modules/
                ├── lista-service.js       # Gerenciamento de listas
                ├── sorteio-service.js     # Lógica de sorteio
                ├── notificacao-service.js # Sistema de notificações
                ├── UI.js                  # Interface do usuário
                ├── participante-model.js  # Modelo de dados
                ├── validacao-utils.js     # Utilitários de validação
                └── mensagens.js           # Centralização de mensagens
```

## Tecnologias Utilizadas

- **Frontend**: JavaScript (ES Modules), HTML5, CSS3
- **Backend**: Node.js, Express
- **Envio de Emails**: SendGrid
- **Persistência**: Arquivos JSON

## Instalação

1. Clone o repositório para o seu computador:
    ```bash
    git clone https://github.com/seu-usuario/amigo-secreto.git
    ```
    
2. Navegue até o diretório do projeto:
    ```bash
    cd amigo-secreto
    ```

3. Instale as dependências:
    ```bash
    npm install
    ```

## Dependências

O projeto utiliza as seguintes dependências principais:
- express: Servidor web
- cors: Suporte para Cross-Origin Resource Sharing
- dotenv: Gerenciamento de variáveis de ambiente
- @sendgrid/mail: Envio de emails

## Como Executar o Projeto

1. Configure as variáveis de ambiente:
   - Edite o arquivo `.env.example` na raiz do projeto com o seguinte conteúdo:
   ```
   SENDGRID_API_KEY=sua_chave_api
   SENDGRID_FROM_EMAIL=seu_email@exemplo.com
   ```
   - Renomeie o arquivo para `.env`.

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse a aplicação em `http://localhost:3000` ou na porta que escolheu.

4. Adicione os participantes preenchendo nome e email, depois clique em "Adicionar".

5. Após inserir todos os participantes (mínimo 3), clique em "Sortear" para realizar o sorteio do amigo secreto.

## Funcionalidades

1. **Adição de Participantes**:
    - Adiciona novos participantes com nome e email
    - Validação de dados para garantir informações corretas
    - Verificação de emails duplicados

2. **Exibição de Participantes**:
    - Lista de participantes atualizada em tempo real
    - Possibilidade de remover participantes da lista

3. **Sorteio de Amigo Secreto**:
    - Algoritmo que garante que ninguém tire a si mesmo
    - Envio automático de emails para todos os participantes
    - Sorteios armazenados para consulta futura

4. **Persistência de Dados**:
    - Armazenamento em arquivos JSON no servidor
    - Recuperação de listas por token único

5. **Feedback Visual**:
    - Sistema de notificações para sucesso e erro
    - Indicadores visuais durante operações assíncronas

## Arquitetura

O projeto segue uma arquitetura modular baseada em serviços com separação clara entre frontend e backend:

### Frontend
- **UI**: Responsável pela interface e interações do usuário
- **Serviços**: Comunicação com o backend via API REST
- **Validação**: Validação de dados antes de envio ao servidor

### Backend
- **API REST**: Endpoints para gerenciamento de listas e sorteios
- **Persistência**: Armazenamento em arquivos JSON
- **Email**: Integração com SendGrid para envio de emails

## Possíveis Problemas e Soluções

### Problema: Emails não estão sendo enviados.
- **Solução**: Verifique se a chave API do SendGrid está corretamente configurada no arquivo `.env`.

### Problema: Servidor não inicia corretamente.
- **Solução**: Verifique se a porta 3000 não está sendo usada por outro serviço e se todas as dependências foram instaladas.

### Problema: Erros de validação ao adicionar participantes.
- **Solução**: Certifique-se de usar um email válido e um nome com pelo menos 3 caracteres.

## Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Siga os padrões de código estabelecidos
4. Use o módulo `validacao-utils.js` para todas as validações de regras de negócio
5. Utilize o objeto `MENSAGENS` do `mensagens.js` para todas as mensagens exibidas
6. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
7. Envie para o GitHub (`git push origin feature/nova-funcionalidade`)
8. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

