import { MENSAGENS } from './mensagens.js';

export class ValidacaoUtils {
    /**
     * Valida se um determinado valor é um endereço de e-mail válido.
     * 
     * @param {string} email - O endereço de e-mail a ser validado.
     * @returns {boolean} - Retorna true se o e-mail for válido, caso contrário, retorna false.
     * @example
     * // Retorna true
     * ValidacaoUtils.validarEmail('usuario@dominio.com');
     * 
     * // Retorna false
     * ValidacaoUtils.validarEmail('usuario@dominio');
     */
    static validarEmail(email) {
        if (!email) return false;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
    }

    /**
     * Valida se um nome possui pelo menos 3 caracteres após remover espaços em branco.
     * @param {string} nome - O nome a ser validado
     * @returns {boolean} - Retorna true se o nome tiver 3 ou mais caracteres após a remoção de espaços, caso contrário retorna false
     */
    static validarNome(nome) {
        if (!nome) return false;
        return nome.trim().length >= 3;
    }

    /**
     * Valida um objeto participante com base em regras específicas.
     * 
     * @param {Object} participante - O objeto participante a ser validado
     * @param {string} participante.nome - O nome do participante
     * @param {string} participante.email - O email do participante
     * @returns {Object} Um objeto contendo o resultado da validação
     * @returns {boolean} returns.valido - Indica se o participante é válido
     * @returns {string[]} returns.erros - Array com mensagens de erro, se houver
     */
    static validarParticipante(participante) {
        if (!participante) {
            return {
                valido: false,
                erros: [MENSAGENS.ERRO.VALIDACAO.PARTICIPANTE_INVALIDO]
            };
        }

        const erros = [];

        if (!this.validarNome(participante.nome)) {
            erros.push(MENSAGENS.ERRO.VALIDACAO.NOME_CURTO);
        }

        if (!this.validarEmail(participante.email)) {
            erros.push(MENSAGENS.ERRO.VALIDACAO.EMAIL_INVALIDO);
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    /**
     * Valida uma lista de participantes para o sorteio
     * @param {Array} participantes - Array contendo os participantes do sorteio
     * @returns {Object} Um objeto indicando se a lista é válida
     * @returns {boolean} valido - Indica se a lista de participantes é válida
     * @returns {string|undefined} erro - Mensagem de erro, se houver algum problema na validação
     */
    static validarListaParticipantes(participantes) {
        if (!Array.isArray(participantes)) {
            return {
                valido: false,
                erro: MENSAGENS.ERRO.LISTA_INVALIDA
            };
        }

        if (participantes.length < 3) {
            return {
                valido: false,
                erro: MENSAGENS.ERRO.VALIDACAO.MIN_PARTICIPANTES
            };
        }

        // TODO: Remover comentário quando colocar em produção
        // Validação de emails duplicados temporariamente desabilitada para desenvolvimento
        /*
        const emails = new Set(participantes.map(p => p.email));
        if (emails.size !== participantes.length) {
            return {
            valido: false,
            erro: 'Existem emails duplicados na lista'
            };
        }
        */

        return { valido: true };
    }

    static validarToken(token) {
        return {
            valido: typeof token === 'string' && token.length > 0,
            erro: MENSAGENS.ERRO.TOKEN_INVALIDO
        };
    }

    static validarIndiceParticipante(index, tamanhoLista) {
        const indexNum = parseInt(index);
        return {
            valido: !isNaN(indexNum) && indexNum >= 0 && indexNum < tamanhoLista,
            erro: MENSAGENS.ERRO.INDICE_INVALIDO
        };
    }
}