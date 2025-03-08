export class SorteioService {
    constructor(listaService) {
        this.listaService = listaService;
        this.sorteioEmAndamento = false;
    }

    /**
     * Realiza um sorteio para a lista atual.
     * 
     * @async
     * @returns {Promise<Object>} Uma promessa que resolve para o resultado do sorteio.
     * @throws {Error} Se a requisição falhar ou se não existir um token válido.
     */
    async realizarSorteio() {
        try {
            if (this.sorteioEmAndamento) {
                throw new Error('Aguarde, sorteio em andamento...');
            }

            this.sorteioEmAndamento = true;

            if (!this.listaService.token) {
                throw new Error('Token da lista não encontrado');
            }
    
            const resposta = await fetch(`${this.listaService.baseUrl}/listas/${this.listaService.token}/sortear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.erro || 'Erro ao realizar sorteio');
            }
    
            return await resposta.json();
        } catch (erro) {
            console.error('Erro ao realizar sorteio:', erro);
            throw erro;
        }
    }

    /**
     * Reseta o estado do sorteio.
     */
    resetarEstadoSorteio() {
        this.sorteioEmAndamento = false;
    }
}