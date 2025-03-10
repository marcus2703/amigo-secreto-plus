Coletando informações do workspace# Amigo Secreto - Sistema de Sorteio

## Descrição

Sistema completo para organização e sorteio de amigos secretos com envio automático de emails. Esta aplicação web permite o cadastro de usuários, gerenciamento de múltiplas listas de participantes, realização de sorteios e notificação dos participantes por email sobre quem tiraram no sorteio.

## Funcionalidades Principais

1. **Sistema de Login e Autenticação**:
   - Login com email (sem necessidade de senha)
   - Associação de listas a usuários específicos
   - Persistência de sessão

2. **Gerenciamento de Listas**:
   - Criação de múltiplas listas de amigo secreto
   - Edição dos nomes das listas
   - Visualização do histórico de listas
   - Exclusão de listas não desejadas

3. **Gestão de Participantes**:
   - Adição e remoção de participantes em cada lista
   - Validação de dados (nome e email)
   - Visualização em tempo real dos participantes adicionados

4. **Realização de Sorteios**:
   - Algoritmo que garante que ninguém tire a si mesmo
   - Envio automático de emails para todos os participantes
   - Histórico de sorteios realizados por lista

5. **Interface Responsiva**:
   - Design adaptável para diferentes dispositivos
   - Feedback visual para todas as operações
   - Sistema de notificações para sucesso e erro

## Estrutura do Projeto

```
amigo-secreto/
│
├── index.html              # Interface principal da aplicação
├── package.json            # Configurações do projeto
│
└── src/
    ├── data/               # Armazenamento de dados
    │   ├── listas.json     # Armazenamento de listas de amigo secreto
    │   └── usuarios.json   # Armazenamento de usuários
    │
    └── assets/
        ├── styles/         # Folhas de estilo CSS
        │   ├── reset.css      # Reset de estilos padrão
        │   ├── base.css       # Estilos base
        │   ├── layout.css     # Estrutura da página
        │   ├── components.css # Componentes específicos
        │   └── responsive.css # Estilização responsiva
        │
        ├── images/         # Imagens e recursos visuais
        │   └── logo.png    # Logo do sistema
        │
        └── scripts/
            │
            ├── frontend.js           # Ponto de entrada e inicialização
            ├── server.js             # Servidor Node.js/Express
            │
            └── modules/
                ├── lista-service.js       # Gerenciamento de listas
                ├── login-service.js       # Autenticação e sessão
                ├── sorteio-service.js     # Lógica de sorteio
                ├── notificacao-service.js # Sistema de notificações
                ├── UI.js                  # Interface do usuário
                ├── participante-model.js  # Modelo de dados
                ├── validacao-utils.js     # Utilitários de validação
                └── mensagens.js           # Centralização de mensagens
```

## Tecnologias Utilizadas

- **Frontend**: 
  - JavaScript (ES Modules)
  - HTML5 
  - CSS3 
  - Material Icons

- **Backend**: 
  - Node.js
  - Express
  - Sistema de arquivos nativo (fs)

- **Envio de Emails**: 
  - SendGrid API

- **Persistência**: 
  - Arquivos JSON

- **Ambiente e Configuração**:
  - dotenv
  - nodemon (desenvolvimento)
  - CORS

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

## Configuração

1. Configure as variáveis de ambiente:
   - Copie o arquivo .env.example para .env
   - Preencha com suas credenciais:
   ```
   PORT=3000
   SENDGRID_API_KEY=sua_chave_api_aqui
   SENDGRID_FROM_EMAIL=seu_email@exemplo.com
   ```

2. Inicie o servidor:
   ```bash
   # Para desenvolvimento (com hot reload)
   npm run dev
   
   # Para produção
   npm start
   ```

3. Acesse a aplicação em `http://localhost:3000` (ou a porta que configurou).

## Fluxo de Uso

1. **Primeiro Acesso**:
   - A tela de login é mostrada automaticamente
   - Insira seu email para fazer login ou criar conta
   - Para novos usuários, uma lista inicial é criada automaticamente

2. **Gerenciamento de Listas**:
   - Na tela inicial, você verá todas as suas listas
   - Clique em "Nova Lista" para criar uma nova lista
   - Clique na lixeira para excluir uma lista (confirmação necessária)
   - Clique em uma lista para gerenciar seus participantes

3. **Gerenciamento de Participantes**:
   - Adicione participantes com nome e email
   - Remova participantes clicando no ícone de remoção
   - Quando tiver pelo menos 3 participantes, realize o sorteio

4. **Sorteio e Envio de Emails**:
   - Clique no botão "Sortear" 
   - O sistema realiza o sorteio e envia emails automaticamente
   - Cada participante recebe um email informando quem tirou no amigo secreto

5. **Navegação**:
   - Use o botão flutuante para voltar à lista de listas
   - O nome do usuário logado aparece no topo da aplicação
   - Clique em "Sair" para encerrar sua sessão

## Arquitetura

O projeto segue uma arquitetura modular baseada em serviços:

### Frontend
- **UI (UI.js)**: Responsável por toda a renderização e atualização de elementos na interface
- **Serviços**: Comunicação com o backend via API REST
  - **ListaService**: Gerencia operações CRUD para listas e participantes
  - **LoginService**: Gerencia autenticação e sessão de usuário
  - **SorteioService**: Realiza operações de sorteio
  - **NotificacaoService**: Centraliza feedback visual para o usuário
- **Validação**: Validação de dados feita pelo ValidacaoUtils antes do envio ao servidor

### Backend
- **API REST**: Endpoints organizados para gerenciamento de recursos
  - **/api/usuarios/**: Rotas para login e gerenciamento de usuários
  - **/api/listas/**: Rotas para CRUD de listas e participantes
  - **/api/listas/:token/sortear**: Endpoint para realização de sorteios
- **Persistência**: Armazenamento em arquivos JSON estruturados
- **Email**: Integração com SendGrid para envio de emails personalizados

## Segurança e Boas Práticas

- Validação de dados tanto no cliente quanto no servidor
- Proteção básica de rotas com verificação de token
- Centralização de mensagens em arquivo específico
- Separação clara entre responsabilidades (MVC)
- Manipulação adequada de erros e feedback ao usuário
- Design responsivo e acessível

## Possíveis Problemas e Soluções

### Problema: Emails não estão sendo enviados.
- **Solução**: Verifique se a chave API do SendGrid está corretamente configurada no arquivo .env. Confirme se o serviço SendGrid está ativo e se suas cotas de envio não foram atingidas.

### Problema: Servidor não inicia corretamente.
- **Solução**: Verifique se a porta configurada (padrão 3000) não está sendo usada por outro serviço. Confirme que todas as dependências foram instaladas corretamente com `npm install`.

### Problema: Erros de validação ao adicionar participantes.
- **Solução**: Certifique-se de usar um email válido (formato user@domain.com) e um nome com pelo menos 3 caracteres.

### Problema: Listas não aparecem após login.
- **Solução**: Verifique se os arquivos JSON em data têm permissão de leitura e escrita para o usuário que está executando a aplicação.

## Extensões e Melhorias Futuras

- Implementação de autenticação mais robusta (com senha)
- Personalização de mensagens de email
- Adição de datas e lembretes para o amigo secreto
- Interface para visualização de sorteios passados
- Exportação de listas em formatos comuns (CSV, PDF)
- Convite para participantes através de link direto

## Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Siga os padrões de código estabelecidos
4. Use o módulo validacao-utils.js para todas as validações de regras de negócio
5. Utilize o objeto `MENSAGENS` do mensagens.js para todas as mensagens exibidas
6. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
7. Envie para o GitHub (`git push origin feature/nova-funcionalidade`)
8. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.