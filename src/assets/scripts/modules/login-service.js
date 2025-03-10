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
            
            return usuario;
        } catch (erro) {
            notificacaoService.mostrarErro(erro.message);
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
}

// Singleton para uso global
export const loginService = new LoginService();