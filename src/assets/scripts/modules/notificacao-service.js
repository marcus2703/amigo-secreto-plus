export class NotificacaoService {
    /**
     * @constructor
     * @description Construtor que inicializa o serviço de notificação
     * @memberof NotificacaoService
     * @instance
     * @this {NotificacaoService}
     * @summary Inicializa as referências DOM para o modal de erro e elemento de mensagem
     * @property {HTMLElement} modal - Elemento DOM que representa o modal de erro
     * @property {HTMLElement} mensagemElement - Elemento DOM que exibirá a mensagem de erro
     */
    constructor() {
        this.modal = document.getElementById('modal-erro');
        this.titulo = document.getElementById('modal-titulo');
        this.mensagem = document.getElementById('modal-mensagem');
    }
    /**
     * Exibe uma notificação de sucesso com a mensagem fornecida.
     * @param {string} mensagem - A mensagem a ser exibida na notificação de sucesso.
     * @returns {void}
     */
    mostrarSucesso(mensagem) {
        if (this.modal && this.mensagem && this.titulo) {
            this.titulo.textContent = 'Sucesso!';
            this.titulo.style.color = '#4CAF50';
            this.mensagem.textContent = mensagem;
            this.modal.style.display = 'block';
        }
    }

    /**
     * Exibe uma mensagem de erro utilizando o serviço de notificação.
     * 
     * @param {string} mensagem - A mensagem de erro a ser exibida.
     * @returns {void}
     */
    mostrarErro(mensagem) {
        if (this.modal && this.mensagem && this.titulo) {
            this.titulo.textContent = 'Erro';
            this.titulo.style.color = '#ff4444';
            this.mensagem.textContent = mensagem;
            this.modal.style.display = 'block';
        } else {
            console.error('Elementos do modal não encontrados');
        }
    }

    /**
     * Remove as classes de visibilidade e estilo do modal de notificação.
     * 
     * Este método remove as classes 'visible', 'modal-sucesso' e 'modal-erro'
     * do elemento modal, efetivamente fechando a notificação e removendo
     * qualquer estilo específico de sucesso ou erro aplicado a ela.
     */
    fecharNotificacao() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

// Singleton para uso global
/**
 * Exporta uma instância do serviço de notificação.
 * 
 * Esta constante representa uma instância inicializada do serviço de notificação
 * que pode ser importada e usada em outros módulos para exibir mensagens de notificação
 * ao usuário.
 * 
 * @type {NotificacaoService}
 */
export const notificacaoService = new NotificacaoService();