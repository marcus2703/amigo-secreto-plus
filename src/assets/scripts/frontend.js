import { ListaService } from './modules/lista-service.js';
import { notificacaoService } from './modules/notificacao-service.js';
import { SorteioService } from './modules/sorteio-service.js';
import { loginService } from './modules/login-service.js';
import { UI } from './modules/UI.js';
import { ValidacaoUtils } from './modules/validacao-utils.js';
import { Participante } from './modules/participante-model.js';
import { MENSAGENS } from './modules/mensagens.js';

// Instâncias globais dos serviços
const listaService = new ListaService();
const sorteioService = new SorteioService(listaService);
const ui = new UI(listaService, sorteioService, notificacaoService, loginService);

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Aplicação iniciada com sucesso!');
    
    // Configura eventos de login/logout primeiro
    configurarEventosLogin();
    
    // Verificar autenticação e inicializar UI de acordo
    if (loginService.estaAutenticado()) {
        // Se o usuário já estiver autenticado, inicializa a UI completa
        ui.inicializar(true)
            .then(() => ui.atualizarUIUsuarioLogado())
            .catch(erro => {
                console.error('Erro ao inicializar UI para usuário autenticado:', erro);
                notificacaoService.mostrarErro(MENSAGENS.ERRO.INICIALIZAR_UI_LOGADO);
                // Em caso de erro, força logout e reinicia
                loginService.logout();
                ui.atualizarUIUsuarioDeslogado();
            });
    } else {
        // Se não estiver autenticado, inicializa apenas a parte básica da UI
        ui.inicializarBasico()
            .then(() => {
                // Mostrar modal de login automaticamente
                const modalLogin = document.getElementById('modal-login');
                if (modalLogin) {
                    modalLogin.style.display = 'block';
                }
                // Ocultar formulário de participantes até que o usuário faça login
                ocultarFormularioParticipantes();
                // Exibir mensagem orientando o usuário a fazer login
                notificacaoService.mostrarErro(MENSAGENS.ERRO.LOGIN_NECESSARIO);
            })
            .catch(erro => {
                console.error('Erro ao inicializar UI básica:', erro);
            });
    }
});

/**
 * Oculta o formulário de adição de participantes até que o usuário faça login
 */
function ocultarFormularioParticipantes() {
    const mainContent = document.querySelector('.main-content__main_text-area');
    const formulario = document.querySelector('.main-content__main_form');
    
    if (mainContent && formulario) {
        formulario.style.display = 'none';
        
        // Adicionar mensagem de orientação
        const msgLogin = document.createElement('p');
        msgLogin.id = 'msg-login-required';
        msgLogin.className = 'login-required-message';
        msgLogin.innerHTML = 'Faça login para gerenciar suas listas de amigo secreto <span class="material-icons">login</span>';
        mainContent.insertBefore(msgLogin, formulario);
    }
}

/**
 * Mostra novamente o formulário de participantes após o login
 */
function mostrarFormularioParticipantes() {
    const formulario = document.querySelector('.main-content__main_form');
    const msgLogin = document.getElementById('msg-login-required');
    
    if (formulario) {
        formulario.style.display = 'flex';
    }
    
    if (msgLogin) {
        msgLogin.remove();
    }
}

function configurarEventosLogin() {
    const botaoLogin = document.getElementById('botao-login');
    const botaoLogout = document.getElementById('botao-logout');
    const modalLogin = document.getElementById('modal-login');
    const botaoConfirmarLogin = document.getElementById('botao-confirmar-login');
    
    if (botaoLogin) {
        botaoLogin.addEventListener('click', () => {
            if (modalLogin) modalLogin.style.display = 'block';
        });
    }
    
    if (botaoLogout) {
        botaoLogout.addEventListener('click', () => {
            // Limpa o token da lista no listaService também
            listaService.token = null;
            
            // Faz o logout
            loginService.logout();
            
            // Limpa a lista de participantes na UI
            const listaParticipantes = document.getElementById('lista-participantes');
            if (listaParticipantes) {
                listaParticipantes.style.display = 'none';
                listaParticipantes.innerHTML = '';
            }
            
            // Atualiza a UI
            ui.atualizarUIUsuarioDeslogado();
            
            // Ocultar formulário ao fazer logout
            ocultarFormularioParticipantes();
            
            // Exibir novamente o modal de login
            if (modalLogin) {
                setTimeout(() => {
                    modalLogin.style.display = 'block';
                }, 500); // Pequeno atraso para melhor UX
            }
            
            notificacaoService.mostrarSucesso(MENSAGENS.SUCESSO.LOGOUT_SUCESSO);
        });
    }
    
    if (botaoConfirmarLogin) {
        botaoConfirmarLogin.addEventListener('click', async () => {
            const emailInput = document.getElementById('login-email');
            if (!emailInput || !emailInput.value.trim()) {
                notificacaoService.mostrarErro(MENSAGENS.ERRO.VALIDACAO.EMAIL_VAZIO);
                return;
            }
            
            try {
                await loginService.login(emailInput.value.trim());
                fecharModalLogin();
                
                // Mostrar o formulário após login
                mostrarFormularioParticipantes();
                
                // Após login bem-sucedido, inicializa a UI completa
                await ui.inicializar(true);
                ui.atualizarUIUsuarioLogado();
                
                notificacaoService.mostrarSucesso(MENSAGENS.SUCESSO.LOGIN_SUCESSO);
            } catch (erro) {
                console.error('Erro no login:', erro);
                notificacaoService.mostrarErro(MENSAGENS.ERRO.LOGIN_FALHOU);
            }
        });
    }
}

// Modifiquei a função adicionarParticipante para não exibir confirmação de sucesso
window.adicionarParticipante = async function() {
    const nomeInput = document.getElementById('participante');
    const emailInput = document.getElementById('email');
    
    if (!nomeInput || !emailInput) return;
    
    try {
        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        
        // Validação rápida para evitar requisição desnecessária
        if (!nome || !email) {
            notificacaoService.mostrarErro('Nome e email são obrigatórios');
            return;
        }
        
        const participante = new Participante(nome, email);
        const validacao = ValidacaoUtils.validarParticipante(participante);
        
        if (!validacao.valido) {
            notificacaoService.mostrarErro(validacao.erros.join(', '));
            return;
        }
        
        // Adiciona o participante
        await listaService.adicionarParticipante(participante);
        
        // Limpa os campos do formulário
        nomeInput.value = '';
        emailInput.value = '';
        nomeInput.focus(); // Foca no campo de nome para facilitar adição contínua
        
        // Atualiza a lista sem mostrar confirmação
        const lista = await listaService.carregarLista();
        ui.atualizarListaParticipantes(lista.participantes);
        
        // Não mostra notificação de sucesso para tornar a experiência mais fluida
        // notificacaoService.mostrarSucesso('Participante adicionado com sucesso');
    } catch (erro) {
        console.error('Erro ao adicionar participante:', erro);
        notificacaoService.mostrarErro('Erro ao adicionar participante');
    }
};

window.sortearNome = async function() {
    // Verifica se já existe um sorteio em andamento
    if (sorteioService.sorteioEmAndamento) {
        return;
    }

    const botaoSortear = document.getElementById('bt_sorteio');
    if (!botaoSortear) {
        console.error('Botão de sorteio não encontrado');
        return;
    }
    
    try {
        // Desabilita o botão e marca início do sorteio
        botaoSortear.disabled = true;
        botaoSortear.textContent = 'Sorteando...';
        
        const resultado = await sorteioService.realizarSorteio();
        
        notificacaoService.mostrarSucesso(resultado.mensagem);
    } catch (erro) {
        console.error('Erro ao realizar sorteio:', erro);
        notificacaoService.mostrarErro(erro.message || 'Erro ao realizar sorteio');
    } finally {
        // Reativa o botão e reseta o estado do sorteio
        botaoSortear.disabled = false;
        botaoSortear.innerHTML = 'Sortear Amigo <span class="material-icons">person</span>';
        sorteioService.resetarEstadoSorteio();
    }
};

window.fecharModal = function() {
    notificacaoService.fecharNotificacao();
};

window.fecharModalLogin = function() {
    const modalLogin = document.getElementById('modal-login');
    if (modalLogin) modalLogin.style.display = 'none';
    
    // Se o usuário fechar o modal sem fazer login, verificar estado
    if (!loginService.estaAutenticado()) {
        // Mantenha o formulário oculto
        ocultarFormularioParticipantes();
    }
};

// Expõe a função de mostrar login para uso externo
window.abrirModalLogin = function() {
    const modalLogin = document.getElementById('modal-login');
    if (modalLogin) modalLogin.style.display = 'block';
};

window.removerParticipante = async function(index) {
    try {
        await listaService.removerParticipante(index);
        const lista = await listaService.carregarLista();
        ui.atualizarListaParticipantes(lista.participantes);
        notificacaoService.mostrarSucesso('Participante removido com sucesso');
    } catch (erro) {
        console.error('Erro ao remover participante:', erro);
        notificacaoService.mostrarErro('Erro ao remover participante');
    }
};

window.selecionarLista = async function(token) {
    try {
        // Atualiza o token da lista no localStorage
        localStorage.setItem('listaToken', token);
        listaService.token = token;
        
        // Inicializa a UI com a nova lista
        await ui.inicializar(true);
        
        // Mostra o formulário de participantes
        mostrarFormularioParticipantes();
        
        // Esconde o painel de listas
        const listasUsuario = document.getElementById('listas-usuario');
        if (listasUsuario) listasUsuario.style.display = 'none';
        
        // Mostra o botão de voltar para listas
        const botaoVoltar = document.getElementById('botao-voltar-listas');
        if (botaoVoltar) botaoVoltar.style.display = 'flex';
        
        notificacaoService.mostrarSucesso('Lista carregada com sucesso!');
    } catch (erro) {
        console.error('Erro ao selecionar lista:', erro);
        notificacaoService.mostrarErro('Erro ao carregar a lista');
    }
};

window.fecharModalNovaLista = function() {
    const modalNovaLista = document.getElementById('modal-nova-lista');
    if (modalNovaLista) modalNovaLista.style.display = 'none';
    
    // Limpa o campo de entrada
    const nomeInput = document.getElementById('nova-lista-nome');
    if (nomeInput) nomeInput.value = '';
};

window.voltarParaListas = async function() {
    try {
        // Mostra o painel de listas
        const listasUsuario = document.getElementById('listas-usuario');
        if (listasUsuario) {
            listasUsuario.style.display = 'block';
            
            // Atualiza a lista de listas (para caso tenha havido mudanças)
            const listas = await loginService.obterListasDoUsuario();
            ui._renderizarListasUsuario(listas);
        }
        
        // Esconde a lista de participantes
        const listaParticipantes = document.getElementById('lista-participantes');
        if (listaParticipantes) listaParticipantes.style.display = 'none';
        
        // Esconde o botão de voltar
        const botaoVoltar = document.getElementById('botao-voltar-listas');
        if (botaoVoltar) botaoVoltar.style.display = 'none';
        
        // Reseta o nome da lista atual
        const listaNome = document.getElementById('lista-nome');
        if (listaNome) listaNome.textContent = '';
    } catch (erro) {
        console.error('Erro ao voltar para listas:', erro);
        notificacaoService.mostrarErro('Erro ao carregar suas listas');
    }
};

window.fecharModalConfirmacao = function() {
    const modalConfirmacao = document.getElementById('modal-confirmar-exclusao');
    if (modalConfirmacao) modalConfirmacao.style.display = 'none';
};