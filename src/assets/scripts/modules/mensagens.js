export const MENSAGENS = {
    ERRO: {
        LISTA_NAO_ENCONTRADA: 'Lista não encontrada',
        PARTICIPANTE_INVALIDO: 'Dados do participante inválidos',
        MINIMO_PARTICIPANTES: 'É necessário ter pelo menos 3 participantes',
        SORTEIO_EM_ANDAMENTO: 'Aguarde, sorteio em andamento...',
        EMAIL_DUPLICADO: 'Email já cadastrado na lista',
        TOKEN_NAO_ENCONTRADO: 'Token da lista não encontrado',
        CRIAR_LISTA: 'Erro ao criar lista',
        ADICIONAR_PARTICIPANTE: 'Falha ao adicionar participante',
        SALVAR_LISTA: 'Erro ao salvar lista',
        LER_LISTA: 'Erro ao ler arquivo de listas',
        ENVIAR_EMAIL: 'Erro ao enviar emails',
        TOKEN_NAO_FORNECIDO: 'Token não fornecido',
        INDICE_INVALIDO: 'Índice de participante inválido',
        CARREGAR_LISTA: 'Erro ao carregar lista',
        CARREGAR_PARTICIPANTES: 'Erro ao carregar participantes',
        REALIZAR_SORTEIO: 'Erro ao realizar sorteio',
        VALIDAR_LISTA: 'Erro ao validar lista',
        TOKEN_INVALIDO: 'Token inválido ou não fornecido',
        LISTA_INVALIDA: 'Lista de participantes inválida',
        LOGIN_FALHOU: 'Não foi possível realizar o login',
        USUARIO_NAO_AUTENTICADO: 'Usuário não está autenticado',
        CARREGAR_LISTAS_USUARIO: 'Não foi possível carregar as listas do usuário',
        VALIDACAO: {
            NOME_CURTO: 'Nome deve ter no mínimo 3 caracteres',
            EMAIL_INVALIDO: 'Email inválido',
            PARTICIPANTE_INVALIDO: 'Participante inválido',
            MIN_PARTICIPANTES: 'É necessário no mínimo 3 participantes para realizar o sorteio',
            EMAILS_DUPLICADOS: 'Existem emails duplicados na lista',
            EMAIL_VAZIO: 'O email não pode ser vazio',
        },
        INICIALIZAR_UI: 'Erro ao inicializar interface do usuário:',
        REMOVER_PARTICIPANTE: 'Erro ao remover participante:',
        INICIALIZAR_UI_BASICA: 'Erro ao inicializar interface básica',
        INICIALIZAR_UI_LOGADO: 'Erro ao inicializar para usuário logado',
        LISTA_REMOVE: 'A lista foi removida ou não existe mais',
        TOKEN_EXPIRADO: 'Sua sessão expirou, faça login novamente',
        LOGIN_NECESSARIO: 'Faça login para começar a criar e gerenciar suas listas de amigo secreto',
        REMOVER_LISTA: 'Não foi possível remover a lista',
        CONFIRMAR_REMOCAO_LISTA: 'Tem certeza que deseja remover esta lista? Esta ação não pode ser desfeita.',
    },
    SUCESSO: {
        PARTICIPANTE_ADICIONADO: 'Participante adicionado com sucesso',
        PARTICIPANTE_REMOVIDO: 'Participante removido com sucesso',
        SORTEIO_REALIZADO: 'Sorteio realizado! Os participantes receberão um email com seu amigo secreto',
        LISTA_CRIADA: 'Lista criada com sucesso',
        EMAILS_ENVIADOS: 'Todos os emails foram enviados com sucesso',
        LOGIN_SUCESSO: 'Login realizado com sucesso! Você já pode criar e gerenciar suas listas.',
        LOGOUT_SUCESSO: 'Logout realizado com sucesso. Volte sempre!',
        LISTA_REMOVIDA: 'Lista removida com sucesso',
    },
    INFO: {
        INICIO_ENVIO_EMAILS: '🎲 Iniciando processo de envio de emails...',
        EMAIL_ENVIADO: (email) => `✅ Email enviado com sucesso para: ${email}`,
        ERRO_ENVIO_EMAIL: '❌ Erro ao enviar email:',
        SERVIDOR_RODANDO: (porta) => `Servidor rodando na porta ${porta}`
    },
    EMAIL: {
        CONFIG: {
            valorSugerido: 'R$ 50,00',
            fontFamily: 'Arial, sans-serif',
            corDestaque: '#e74c3c',
            corTitulo: '#2c3e50',
            corTextoSecundario: '#7f8c8d',
            corValor: '#27ae60',
            corFundoDestaque: '#f8f9fa'
        },
        ASSUNTO: '🎁 Seu Amigo Secreto foi Sorteado!',
        TEMPLATE: (sorteador, sorteado, config) => `
            <div style="font-family: ${config.fontFamily}; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: ${config.corTitulo};">Olá ${sorteador.nome}! 🎉</h1>
                <p style="font-size: 16px; line-height: 1.5;">
                    Seu amigo secreto foi sorteado com sucesso.
                </p>
                <div style="background: ${config.corFundoDestaque}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="font-size: 18px; margin: 0;">
                        Você tirou: <strong style="color: ${config.corDestaque};">${sorteado.nome}</strong>
                    </p>
                    <p style="color: ${config.corValor};">Valor sugerido: ${config.valorSugerido}</p>
                </div>
                <p style="color: ${config.corTextoSecundario}; font-size: 14px;">
                    Este é um email automático do sistema de Amigo Secreto.
                </p>
            </div>`
    },
    UI: {
        BOTOES: {
            EXCLUIR: 'Excluir',
            ADICIONAR: 'Adicionar',
            SORTEAR: 'Sortear',
            LOGIN: 'Entrar',
            LOGOUT: 'Sair',
        },
        LABELS: {
            EMAIL: 'Email:',
            SENHA: 'Senha:',
        },
        TEXTOS: {
            LOGIN_REQUIRED: 'Faça login para gerenciar suas listas de amigo secreto',
        },
        TITULOS: {
            LOGIN: 'Login',
            MINHAS_LISTAS: 'Minhas Listas',
        },
    }
};