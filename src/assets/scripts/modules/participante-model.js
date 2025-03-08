export class Participante {
    constructor(nome, email) {
        this.nome = nome;
        this.email = email;
    }

    static fromJSON(json) {
        return new Participante(json.nome, json.email);
    }

    toJSON() {
        return {
            nome: this.nome,
            email: this.email
        };
    }
}