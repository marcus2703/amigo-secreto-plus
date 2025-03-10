import { MENSAGENS } from './mensagens.js';

export class UI {
    /**
     * @class UI
     * @description Classe responsável por gerenciar a interface do usuário para o sistema de amigo secreto.
     * @constructor
     * @param {ListaService} listaService - Serviço para gerenciar a lista de participantes.
     * @param {SorteioService} sorteioService - Serviço para gerenciar o sorteio do amigo secreto.
     * @param {NotificacaoService} notificacaoService - Serviço para gerenciar as notificações do sistema.
     * @param {LoginService} loginService - Serviço para gerenciar o login de usuários.
     * @property {Array} participantes - Array para armazenar os participantes.
     */
    constructor(listaService, sorteioService, notificacaoService, loginService) {
        this.listaService = listaService;
        this.sorteioService = sorteioService;
        this.notificacaoService = notificacaoService;
        this.loginService = loginService;
        this.participantes = [];
    }

    /**
     * Inicializa apenas o básico da UI sem tentar carregar listas
     * @returns {Promise<void>}
     */
    async inicializarBasico() {
        try {
            this.registrarEventos();
            this._verificarEstadoAuth();
            
            // Ao inicializar básico, ainda mantém acesso à mensagem de login necessário
            const msgLogin = document.getElementById('msg-login-required');
            if (msgLogin) {
                msgLogin.addEventListener('click', () => window.abrirModalLogin());
            }
        } catch (erro) {
            console.error('Erro ao inicializar UI básica:', erro);
            throw erro;
        }
    }

    /**
     * Inicializa a interface do usuário.
     * Este método registra os eventos necessários e carrega a lista de participantes.
     * @async
     * @param {boolean} carregarLista - Se deve tentar carregar a lista
     * @returns {Promise<void>} Uma promise que é resolvida quando a inicialização for concluída.
     */
    async inicializar(carregarLista = false) {
        try {
            await this.inicializarBasico();
            
            // Só tenta carregar a lista se o parâmetro for true
            if (carregarLista && this.loginService.estaAutenticado()) {
                if (this.listaService.token) {
                    const lista = await this.listaService.carregarLista();
                    
                    const listaNomeElement = document.getElementById('lista-nome');
                    if (listaNomeElement) {
                        listaNomeElement.textContent = lista.nome;
                    }
                    
                    this.atualizarListaParticipantes(lista.participantes);
                }
            }
        } catch (erro) {
            console.error('Erro ao inicializar UI:', erro);
            this.notificacaoService.mostrarErro('Não foi possível inicializar a aplicação.');
            throw erro;
        }
    }

    /**
     * Atualiza a interface para refletir que o usuário está logado
     */
    async atualizarUIUsuarioLogado() {
        this._verificarEstadoAuth();
        
        // Garantir que o formulário esteja visível quando o usuário estiver logado
        const formulario = document.querySelector('.main-content__main_form');
        const msgLogin = document.getElementById('msg-login-required');
        
        if (formulario) {
            formulario.style.display = 'flex';
        }
        
        if (msgLogin) {
            msgLogin.remove();
        }
        
        try {
            // Carregar listas do usuário
            const listas = await this.loginService.obterListasDoUsuario();
            this._renderizarListasUsuario(listas);
        } catch (erro) {
            console.error('Erro ao carregar listas do usuário:', erro);
            this.notificacaoService.mostrarErro(MENSAGENS.ERRO.CARREGAR_LISTAS_USUARIO);
        }
    }
    
    /**
     * Atualiza a interface para refletir que o usuário está deslogado
     */
    atualizarUIUsuarioDeslogado() {
        this._verificarEstadoAuth();
        
        // Ocultar painel de listas
        const listasUsuario = document.getElementById('listas-usuario');
        if (listasUsuario) listasUsuario.style.display = 'none';
        
        // Ocultar lista de participantes
        const listaParticipantes = document.getElementById('lista-participantes');
        if (listaParticipantes) listaParticipantes.style.display = 'none';
        
        // Limpar nome da lista
        const listaNome = document.getElementById('lista-nome');
        if (listaNome) listaNome.textContent = '';
    }

    /**
     * Verifica o estado de autenticação e atualiza a UI conforme necessário
     * @private
     */
    _verificarEstadoAuth() {
        const botaoLogin = document.getElementById('botao-login');
        const botaoLogout = document.getElementById('botao-logout');
        const emailUsuario = document.getElementById('email-usuario');
        
        if (this.loginService.estaAutenticado()) {
            // Usuário logado
            if (botaoLogin) botaoLogin.style.display = 'none';
            if (botaoLogout) botaoLogout.style.display = 'block';
            if (emailUsuario) {
                emailUsuario.textContent = this.loginService.usuarioLogado.email;
                emailUsuario.style.display = 'inline-block';
            }
        } else {
            // Usuário não logado
            if (botaoLogin) botaoLogin.style.display = 'block';
            if (botaoLogout) botaoLogout.style.display = 'none';
            if (emailUsuario) emailUsuario.style.display = 'none';
        }
    }
    
    /**
     * Renderiza as listas do usuário na interface
     * @param {Array} listas - Array de objetos contendo as listas do usuário
     * @private
     */
    _renderizarListasUsuario(listas) {
        const containerListas = document.getElementById('container-listas');
        const listasUsuario = document.getElementById('listas-usuario');
        
        if (!containerListas || !listasUsuario) return;
        
        // Mostrar container de listas
        listasUsuario.style.display = 'block';
        
        // Limpar container
        containerListas.innerHTML = '';
        
        // Adicionar botão para criar nova lista
        const novaBotao = document.createElement('div');
        novaBotao.className = 'card-lista nova-lista';
        novaBotao.innerHTML = `
            <span class="material-icons">add_circle</span>
            <h4>Nova Lista</h4>
        `;
        novaBotao.addEventListener('click', () => this._abrirModalNovaLista());
        containerListas.appendChild(novaBotao);
        
        if (!listas || listas.length === 0) {
            const mensagem = document.createElement('p');
            mensagem.textContent = 'Você ainda não possui listas. Clique em "Nova Lista" para criar.';
            mensagem.className = 'lista-vazia-mensagem';
            containerListas.appendChild(mensagem);
            return;
        }
        
        // Criar card para cada lista
        listas.forEach(lista => {
            const card = document.createElement('div');
            card.className = 'card-lista';
            card.onclick = () => window.selecionarLista(lista.id);
            
            const title = document.createElement('h4');
            title.textContent = lista.nome;
            
            const participantes = document.createElement('p');
            participantes.textContent = `${lista.participantes.length} participante(s)`;
            
            const data = document.createElement('div');
            data.className = 'data';
            data.textContent = `Criado em: ${new Date(lista.dataCriacao).toLocaleDateString('pt-BR')}`;
            
            card.appendChild(title);
            card.appendChild(participantes);
            card.appendChild(data);
            
            containerListas.appendChild(card);
        });
    }
    
    /**
     * Abre o modal para criar uma nova lista
     * @private
     */
    _abrirModalNovaLista() {
        // Cria o modal de nova lista dinamicamente se não existir
        let modalNovaLista = document.getElementById('modal-nova-lista');
        
        if (!modalNovaLista) {
            modalNovaLista = document.createElement('div');
            modalNovaLista.id = 'modal-nova-lista';
            modalNovaLista.className = 'modal';
            
            modalNovaLista.innerHTML = `
                <div class="modal-content">
                    <span class="material-icons close" onclick="fecharModalNovaLista()">clear</span>
                    <h3>Nova Lista de Amigo Secreto</h3>
                    <div class="form-login">
                        <div class="form-group">
                            <label for="nova-lista-nome">Nome da Lista:</label>
                            <input type="text" id="nova-lista-nome" class="main-content__main_input" placeholder="Digite o nome da lista">
                        </div>
                        <div class="form-group">
                            <button id="botao-criar-lista" class="main-content__main__button">
                                <span class="material-icons">add</span>Criar Lista
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.querySelector('.main-content').appendChild(modalNovaLista);
            
            // Adiciona evento ao botão de criar
            document.getElementById('botao-criar-lista').addEventListener('click', async () => {
                const nomeInput = document.getElementById('nova-lista-nome');
                const nome = nomeInput?.value?.trim();
                
                if (!nome) {
                    this.notificacaoService.mostrarErro('Digite um nome para a lista');
                    return;
                }
                
                try {
                    await loginService.criarNovaLista(nome);
                    this.notificacaoService.mostrarSucesso(`Lista "${nome}" criada com sucesso!`);
                    
                    // Atualiza a lista de listas
                    const listas = await this.loginService.obterListasDoUsuario();
                    this._renderizarListasUsuario(listas);
                    
                    // Fecha o modal
                    window.fecharModalNovaLista();
                } catch (erro) {
                    console.error('Erro ao criar lista:', erro);
                    this.notificacaoService.mostrarErro(erro.message || MENSAGENS.ERRO.CRIAR_LISTA);
                }
            });
        }
        
        modalNovaLista.style.display = 'block';
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
        // Adicionar evento para a mensagem de login necessário
        const msgLogin = document.getElementById('msg-login-required');
        if (msgLogin) {
            msgLogin.addEventListener('click', () => window.abrirModalLogin());
        }
        
        document.getElementById('btnAdicionar')
            ?.addEventListener('click', () => this.adicionarParticipante());
        
        document.getElementById('btnSortear')
            ?.addEventListener('click', () => this.realizarSorteio());
            
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.notificacaoService.fecharNotificacao();
                // Não fechar modal de login com ESC se não estiver autenticado
                if (this.loginService.estaAutenticado()) {
                    window.fecharModalLogin();
                }
            }
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