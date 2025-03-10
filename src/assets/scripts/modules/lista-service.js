import { notificacaoService } from './notificacao-service.js';
import { MENSAGENS } from './mensagens.js';

export class ListaService {
    /**
     * Construtor do serviço de lista.
     * Inicializa a URL base da API e recupera o token de autenticação do armazenamento local.
     * 
     * @constructor
     * @property {string} baseUrl - URL base para as requisições da API
     * @property {string|null} token - Token de autenticação armazenado no localStorage
     */
    constructor() {
        this.baseUrl = window.location.origin + '/api';
        this.token = localStorage.getItem('listaToken');
    }

    /**
     * Cria uma nova lista de amigo secreto no servidor
     * 
     * @async
     * @param {string} nome - O nome da lista a ser criada
     * @returns {Promise<Object>} Objeto com os dados da lista criada, incluindo o token de acesso
     * @throws {Error} Lança um erro se a requisição falhar, exibindo uma notificação de erro
     * 
     * @example
     * // Criar uma nova lista
     * const listaData = await listaService.criarNovaLista('Amigo Secreto Família');
     */
    async criarNovaLista(nome) {
        try {
            const resposta = await fetch(`${this.baseUrl}/listas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome })
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.mensagem || 'Erro ao criar lista');
            }

            const dados = await resposta.json();
            this.token = dados.token;
            localStorage.setItem('listaToken', dados.token);

            notificacaoService.mostrarSucesso(`Lista "${nome}" criada com sucesso!`);
            return dados;
        } catch (erro) {
            notificacaoService.mostrarErro(erro.message);
            throw erro;
        }
    }


        /**
     * Acessa uma lista específica usando um token
     * @param {string} token - Token único da lista
     * @returns {Promise<Object>} Dados da lista
     * @throws {Error} Quando o token é inválido ou a lista não existe
     */
    async acessarLista(token) {
        try {
            if (!token) {
                throw new Error('Token não fornecido');
            }
    
            const resposta = await fetch(`${this.baseUrl}/listas/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!resposta.ok) {
                throw new Error('Lista não encontrada');
            }
    
            this.token = token;
            localStorage.setItem('listaToken', token);
            
            return await resposta.json();
        } catch (erro) {
            throw new Error(`Erro ao acessar lista: ${erro.message}`);
        }
    }

        /**
     * Carrega os dados de uma lista existente
     * @returns {Promise<Object>} Dados da lista
     * @throws {Error} Quando não há token ou a lista não pode ser carregada
     */
    async carregarLista() {
        try {
            if (!this.token) {
                throw new Error(MENSAGENS.ERRO.TOKEN_NAO_ENCONTRADO);
            }
    
            const resposta = await fetch(`${this.baseUrl}/listas/${this.token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!resposta.ok) {
                // Se o erro for 404, significa que a lista não existe mais
                if (resposta.status === 404) {
                    localStorage.removeItem('listaToken');
                    this.token = null;
                }
                throw new Error(MENSAGENS.ERRO.CARREGAR_LISTA);
            }
    
            return await resposta.json();
        } catch (erro) {
            console.error('Erro ao carregar lista:', erro);
            throw new Error(MENSAGENS.ERRO.CARREGAR_LISTA);
        }
    }

    
        /**
     * Adiciona um novo participante à lista
     * @param {Object} participante - Dados do participante
     * @param {string} participante.nome - Nome do participante
     * @param {string} participante.email - Email do participante
     * @returns {Promise<Object>} Dados do participante adicionado
     * @throws {Error} Quando há falha na adição do participante
     */
    async adicionarParticipante(participante) {
        try {
            if (!this.token) {
                throw new Error('Token da lista não encontrado');
            }
    
            const resposta = await fetch(`${this.baseUrl}/listas/${this.token}/participantes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participante)
            });
    
            if (!resposta.ok) {
                throw new Error('Falha ao adicionar participante');
            }
    
            return await resposta.json();
        } catch (erro) {
            console.error('Erro ao adicionar participante:', erro);
            throw new Error('Não foi possível adicionar o participante');
        }
    }

    
        /**
     * Remove um participante da lista
     * @param {number} index - Índice do participante a ser removido
     * @returns {Promise<boolean>} True se removido com sucesso
     * @throws {Error} Quando há falha na remoção do participante
     */
    async removerParticipante(index) {
        try {
            if (!this.token) {
                throw new Error('Token da lista não encontrado');
            }
    
            const resposta = await fetch(`${this.baseUrl}/listas/${this.token}/participantes/${index}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!resposta.ok) {
                throw new Error('Falha ao remover participante');
            }
    
            // Atualiza cache local se existir
            if (this.participantes) {
                this.participantes = this.participantes.filter((_, i) => i !== index);
            }
    
            return true;
        } catch (erro) {
            console.error('Erro ao remover participante:', erro);
            throw new Error('Não foi possível remover o participante');
        }
    }
}