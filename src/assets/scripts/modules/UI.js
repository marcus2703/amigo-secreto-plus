import { MENSAGENS } from './mensagens.js';

export class UI {
    /**
     * @class UI
     * @description Classe responsável por gerenciar a interface do usuário para o sistema de amigo secreto.
     * @constructor
     * @param {ListaService} listaService - Serviço para gerenciar a lista de participantes.
     * @param {SorteioService} sorteioService - Serviço para gerenciar o sorteio do amigo secreto.
     * @param {NotificacaoService} notificacaoService - Serviço para gerenciar as notificações do sistema.
     * @property {Array} participantes - Array para armazenar os participantes.
     */
    constructor(listaService, sorteioService, notificacaoService) {
        this.listaService = listaService;
        this.sorteioService = sorteioService;
        this.notificacaoService = notificacaoService;
        this.participantes = [];
        this.inicializar();
    }

    /**
     * Inicializa a interface do usuário.
     * Este método registra os eventos necessários e carrega a lista de participantes.
     * @async
     * @returns {Promise<void>} Uma promise que é resolvida quando a inicialização for concluída.
     */
    async inicializar() {
        try {
            this.registrarEventos();
            // Carrega a lista usando o listaService
            const dados = await this.listaService.carregarLista();
            if (dados && dados.participantes) {
                this.participantes = dados.participantes;
                this.atualizarListaParticipantes(this.participantes);
            }
        } catch (erro) {
            console.error(MENSAGENS.ERRO.INICIALIZAR_UI, erro);
            this.notificacaoService.mostrarErro(MENSAGENS.ERRO.CARREGAR_PARTICIPANTES);
        }
    }

    /**
     * Limpa o valor de um campo do formulário e remove seus estados de erro
     * @param {HTMLElement} campo - Campo do formulário a ser limpo
     * @private
     */
    _resetarCampoFormulario(campo) {
        if (campo) {
            campo.value = '';
            campo.classList.remove('error');
        }
    }
    
    /**
     * Limpa todos os campos do formulário de cadastro de participante
     * @public
     */
    resetarFormularioCadastro() {
        const camposFormulario = {
            nome: document.getElementById('participante'),
            email: document.getElementById('email')
        };
    
        Object.values(camposFormulario).forEach(campo => {
            this._resetarCampoFormulario(campo);
        });
    }

    /**
     * Registra os eventos necessários para o funcionamento da interface do usuário.
     * Adiciona listeners para:
     * - Botão de adicionar participante
     * - Botão de realizar sorteio
     * - Tecla Escape para fechar modal de notificação
     * @returns {void}
     */
    registrarEventos() {
        document.getElementById('btnAdicionar')
            ?.addEventListener('click', () => this.adicionarParticipante());
        
        document.getElementById('btnSortear')
            ?.addEventListener('click', () => this.realizarSorteio());
            
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.notificacaoService.fecharModal();
        });
    }

    /**
     * Atualiza a lista de participantes no DOM.
     * 
     * @param {Array} participantes - Array de objetos contendo informações dos participantes
     * @param {string} participantes[].nome - Nome do participante
     * @param {string} participantes[].email - Email do participante
     * @returns {void} - Não retorna valor. Modifica diretamente o DOM.
     * @description Esta função limpa e preenche a lista de participantes na interface,
     * criando um item de lista para cada participante com seu nome e email.
     */
    atualizarListaParticipantes(participantes) {
        const listaEl = document.getElementById('lista-participantes');
        if (!listaEl) return;
    
        listaEl.innerHTML = '';
        listaEl.style.display = participantes.length > 0 ? 'block' : 'none';
        
        // Usar o método criarItemParticipante em vez de criar li diretamente
        participantes.forEach((participante, index) => {
            const itemEl = this.criarItemParticipante(participante, index);
            listaEl.appendChild(itemEl);
        });
    }

    /**
     * Cria um elemento de lista (li) para representar um participante na interface do usuário.
     * 
     * @param {Object} participante - O objeto contendo os dados do participante
     * @param {string} participante.nome - O nome do participante
     * @param {string} participante.email - O email do participante
     * @param {number} index - O índice do participante na lista de participantes
     * @returns {HTMLElement} Elemento li configurado com os dados do participante e botão de remoção
     */
    criarItemParticipante(participante, index) {
        const li = document.createElement('li');
        li.className = 'main-content__main_item';
        li.innerHTML = `
            <span class="participante-info">
                ${participante.nome} 
                <small>(${participante.email})</small>
            </span>
            <button class="remove-button" data-index="${index}" title="${MENSAGENS.UI.BOTOES.EXCLUIR}">
                <span class="material-icons">person_remove</span>
            </button>
        `;
        
        li.querySelector('.remove-button').addEventListener('click', 
            () => this.removerParticipante(index));
            
        return li;
    }

    /**
     * Remove um participante da lista
     * @param {number} index - Índice do participante a ser removido
     */
    async removerParticipante(index) {
        try {
            await this.listaService.removerParticipante(index);
            const lista = await this.listaService.carregarLista();
            this.atualizarListaParticipantes(lista.participantes);
        } catch (erro) {
            console.error(MENSAGENS.ERRO.REMOVER_PARTICIPANTE, erro);
            throw erro; // Propaga o erro para ser tratado no frontend
        }
    }
}