import { MENSAGENS } from './mensagens.js';
import { notificacaoService } from './notificacao-service.js';

export class LoginService {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
        this.usuarioLogado = this.recuperarSessao();
    }

    /**
     * Recupera os dados da sessão do usuário do localStorage
     * @returns {Object|null} Dados do usuário ou null se não houver sessão
     */
    recuperarSessao() {
        const dadosSessao = localStorage.getItem('usuarioLogado');
        return dadosSessao ? JSON.parse(dadosSessao) : null;
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} True se o usuário estiver autenticado
     */
    estaAutenticado() {
        return !!this.usuarioLogado;
    }

    /**
     * Realiza login do usuário
     * @param {string} email - Email do usuário
     * @returns {Promise<Object>} Dados do usuário autenticado
     */
    async login(email) {
        try {
            if (!email || !email.trim()) {
                throw new Error(MENSAGENS.ERRO.VALIDACAO.EMAIL_VAZIO);
            }

            const resposta = await fetch(`${this.baseUrl}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.erro || MENSAGENS.ERRO.LOGIN_FALHOU);
            }

            const usuario = await resposta.json();
            this.usuarioLogado = usuario;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            // Atualiza o token da lista para a primeira lista do usuário (se existir)
            const listas = await this.obterListasDoUsuario().catch(() => []);
            if (listas && listas.length > 0) {
                localStorage.setItem('listaToken', listas[0].id);
            }
            
            return usuario;
        } catch (erro) {
            console.error('Erro no login:', erro);
            throw erro;
        }
    }

    /**
     * Encerra a sessão do usuário
     * @returns {void}
     */
    logout() {
        this.usuarioLogado = null;
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('listaToken'); // Limpa também o token da lista atual
    }

    /**
     * Obtém as listas associadas ao usuário atual
     * @returns {Promise<Array>} Lista de amigos secretos do usuário
     */
    async obterListasDoUsuario() {
        try {
            if (!this.estaAutenticado()) {
                throw new Error(MENSAGENS.ERRO.USUARIO_NAO_AUTENTICADO);
            }

            const resposta = await fetch(`${this.baseUrl}/usuarios/${this.usuarioLogado.token}/listas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!resposta.ok) {
                throw new Error(MENSAGENS.ERRO.CARREGAR_LISTAS_USUARIO);
            }

            return await resposta.json();
        } catch (erro) {
            console.error('Erro ao obter listas do usuário:', erro);
            throw erro;
        }
    }
    
    /**
     * Cria uma nova lista para o usuário logado
     * @param {string} nomeLista - Nome da nova lista
     * @returns {Promise<Object>} Dados da lista criada
     */
    async criarNovaLista(nomeLista) {
        try {
            if (!this.estaAutenticado()) {
                throw new Error(MENSAGENS.ERRO.USUARIO_NAO_AUTENTICADO);
            }

            const resposta = await fetch(`${this.baseUrl}/listas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nomeLista,
                    userToken: this.usuarioLogado.token
                })
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.erro || MENSAGENS.ERRO.CRIAR_LISTA);
            }

            const dados = await resposta.json();
            return dados;
        } catch (erro) {
            console.error('Erro ao criar nova lista:', erro);
            throw erro;
        }
    }
}

// Singleton para uso global
export const loginService = new LoginService();