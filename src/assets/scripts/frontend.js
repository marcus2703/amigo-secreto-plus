import { ListaService } from './modules/lista-service.js';
import { notificacaoService } from './modules/notificacao-service.js';
import { SorteioService } from './modules/sorteio-service.js';
import { UI } from './modules/UI.js';
import { ValidacaoUtils } from './modules/validacao-utils.js';
import { Participante } from './modules/participante-model.js';

// Instâncias globais dos serviços
const listaService = new ListaService();
const sorteioService = new SorteioService(listaService);
const ui = new UI(listaService, sorteioService, notificacaoService);

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Aplicação iniciada com sucesso!');
    
    // Se não houver token, cria uma nova lista
    if (!listaService.token) {
        const nomeLista = `Amigo Secreto ${new Date().toLocaleDateString('pt-BR')}`;
        listaService.criarNovaLista(nomeLista)
            .then(() => ui.inicializar())
            .catch(erro => console.error('Erro ao criar lista:', erro));
    } else {
        // Se já existe token, inicializa UI
        ui.inicializar()
            .catch(erro => console.error('Erro ao inicializar UI:', erro));
    }
});

// Expor funções para o HTML
window.adicionarParticipante = async function() {
    const nomeInput = document.getElementById('participante');
    const emailInput = document.getElementById('email');
    
    if (!nomeInput || !emailInput) return;
    
    try {
        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        
        const participante = new Participante(nome, email);
        const validacao = ValidacaoUtils.validarParticipante(participante);
        
        if (!validacao.valido) {
            notificacaoService.mostrarErro(validacao.erros[0]);
            return;
        }
        
        await listaService.adicionarParticipante(participante);
        
        // Limpar campos e atualizar UI
        nomeInput.value = '';
        emailInput.value = '';
        
        const lista = await listaService.carregarLista();
        ui.atualizarListaParticipantes(lista.participantes);
    } catch (erro) {
        console.error('Erro ao adicionar participante:', erro);
        notificacaoService.mostrarErro('Erro ao adicionar participante.');
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
        botaoSortear.style.opacity = '0.5';
        botaoSortear.style.cursor = 'not-allowed';
        sorteioService.sorteioEmAndamento = true;

        const lista = await listaService.carregarLista();
        if (!lista.participantes || lista.participantes.length < 3) {
            notificacaoService.mostrarErro('É necessário ter pelo menos 3 participantes para realizar o sorteio.');
            return;
        }
        
        await sorteioService.realizarSorteio();
        notificacaoService.mostrarSucesso('Sorteio realizado! Os participantes receberão um email com seu amigo secreto.');
    } catch (erro) {
        notificacaoService.mostrarErro(erro.message || 'Não foi possível realizar o sorteio.');
    } finally {
        // Reabilita o botão e reseta o estado após 5 segundos
        setTimeout(() => {
            botaoSortear.disabled = false;
            botaoSortear.style.opacity = '1';
            botaoSortear.style.cursor = 'pointer';
            sorteioService.sorteioEmAndamento = false;
        }, 5000);
    }
};

window.fecharModal = function() {
    notificacaoService.fecharNotificacao();
};

window.removerParticipante = async function(index) {
    try {
        await listaService.removerParticipante(index);
        const lista = await listaService.carregarLista();
        ui.atualizarListaParticipantes(lista.participantes);
    } catch (erro) {
        notificacaoService.mostrarErro('Erro ao remover participante.');
    }
};