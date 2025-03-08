import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import sgMail from '@sendgrid/mail';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

// Importações dos módulos locais
import { ValidacaoUtils } from './modules/validacao-utils.js';
import { MENSAGENS } from './modules/mensagens.js';

// Configuração do __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializações
config(); // dotenv
const app = express();
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 8080;
const ARQUIVO_LISTAS = join(__dirname, '../../data/listas.json');

// Configurações do Express
app.use(cors({
    origin: true, // Aceita requisições do mesmo origin que o servidor
    credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../../../')));

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Funções Auxiliares
function gerarToken() {
    return crypto.randomBytes(16).toString('hex');
}

async function lerListas() {
    try {
        const dados = await fs.readFile(ARQUIVO_LISTAS, 'utf8');
        return JSON.parse(dados).listas;
    } catch (erro) {
        console.error(MENSAGENS.ERRO.LER_LISTA, erro);
        return [];
    }
}

async function salvarListas(listas) {
    try {
        await fs.writeFile(ARQUIVO_LISTAS, JSON.stringify({ listas }, null, 2));
    } catch (erro) {
        console.error(MENSAGENS.ERRO.SALVAR_LISTA, erro);
        throw erro;
    }
}

async function adicionarParticipante(token, participante) {
    const listas = await lerListas();
    const lista = listas.find(l => l.id === token);
    
    if (!lista) {
        throw new Error(MENSAGENS.ERRO.LISTA_NAO_ENCONTRADA);
    }
    
    lista.participantes.push(participante);
    await salvarListas(listas);
    return lista.participantes;
}

function realizarSorteio(participantes) {
    const participantesEmbaralhados = [...participantes]
        .sort(() => Math.random() - 0.5);
    
    return participantesEmbaralhados.map((participante, index) => ({
        presenteador: participante,
        presenteado: participantesEmbaralhados[(index + 1) % participantesEmbaralhados.length]
    }));
}

function criarMensagemEmail(sorteador, sorteado) {
    return MENSAGENS.EMAIL.TEMPLATE(sorteador, sorteado, MENSAGENS.EMAIL.CONFIG);
}

async function enviarEmails(pares) {
    console.log(MENSAGENS.INFO.INICIO_ENVIO_EMAILS);
    
    const promessasEmails = pares.map(({ presenteador, presenteado }) => {
        const msg = {
            to: presenteador.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: MENSAGENS.EMAIL.ASSUNTO,
            html: criarMensagemEmail(presenteador, presenteado),
            trackingSettings: {
                clickTracking: { enable: true },
                openTracking: { enable: true }
            }
        };

        return sgMail.send(msg)
            .then(response => {
                console.log(MENSAGENS.INFO.EMAIL_ENVIADO(presenteador.email));
                return response;
            })
            .catch(error => {
                console.error(MENSAGENS.INFO.ERRO_ENVIO_EMAIL, error);
                throw error;
            });
    });

    await Promise.all(promessasEmails);
}

// Middlewares
const validarParticipante = (req, res, next) => {
    const resultado = ValidacaoUtils.validarParticipante(req.body);
    if (!resultado.valido) {
        return res.status(400).json({ erro: resultado.erros });
    }
    next();
};

const validarListaSorteio = async (req, res, next) => {
    try {
        const { token } = req.params;
        const listas = await lerListas();
        const lista = listas.find(l => l.id === token);

        if (!lista) {
            return res.status(404).json({ erro: MENSAGENS.ERRO.LISTA_NAO_ENCONTRADA });
        }

        const resultado = ValidacaoUtils.validarListaParticipantes(lista.participantes);
        if (!resultado.valido) {
            return res.status(400).json({ erro: resultado.erro });
        }

        req.lista = lista;
        req.listas = listas;
        next();
    } catch (erro) {
        res.status(500).json({ erro: MENSAGENS.ERRO.VALIDAR_LISTA });
    }
};

// Rotas
app.route('/api/listas/:token')
    .get(async (req, res) => {
        try {
            const { token } = req.params;
            const listas = await lerListas();
            const lista = listas.find(l => l.id === token);
            
            if (!lista) {
                return res.status(404).json({ erro: MENSAGENS.ERRO.LISTA_NAO_ENCONTRADA });
            }
            
            res.json(lista);
        } catch (erro) {
            res.status(500).json({ erro: MENSAGENS.ERRO.CARREGAR_LISTA });
        }
    });

app.route('/api/listas/:token/participantes')
    .get(async (req, res) => {
        try {
            const { token } = req.params;
            const listas = await lerListas();
            const lista = listas.find(l => l.id === token);
            
            if (!lista) {
                return res.status(404).json({ erro: MENSAGENS.ERRO.LISTA_NAO_ENCONTRADA });
            }
            
            res.json(lista.participantes);
        } catch (erro) {
            res.status(500).json({ erro: MENSAGENS.ERRO.CARREGAR_PARTICIPANTES });
        }
    })
    .post(validarParticipante, async (req, res) => {
        try {
            const { token } = req.params;
            const { nome, email } = req.body;
            
            const participantes = await adicionarParticipante(token, { nome, email });
            
            res.status(201).json({ 
                mensagem: MENSAGENS.SUCESSO.PARTICIPANTE_ADICIONADO,
                participantes 
            });
        } catch (erro) {
            res.status(500).json({ erro: MENSAGENS.ERRO.ADICIONAR_PARTICIPANTE });
        }
    });

app.delete('/api/listas/:token/participantes/:index', async (req, res) => {
    try {
        const { token, index } = req.params;
        const listas = await lerListas();
        const lista = listas.find(l => l.id === token);
        
        if (!lista) {
            return res.status(404).json({ erro: MENSAGENS.ERRO.LISTA_NAO_ENCONTRADA });
        }

        const indexNum = parseInt(index);
        if (isNaN(indexNum) || indexNum < 0 || indexNum >= lista.participantes.length) {
            return res.status(400).json({ erro: MENSAGENS.ERRO.INDICE_INVALIDO });
        }

        lista.participantes.splice(indexNum, 1);
        await salvarListas(listas);
        
        res.json({ 
            mensagem: MENSAGENS.SUCESSO.PARTICIPANTE_REMOVIDO,
            participantes: lista.participantes 
        });
    } catch (erro) {
        res.status(500).json({ erro: MENSAGENS.ERRO.REMOVER_PARTICIPANTE });
    }
});

app.post('/api/listas/:token/sortear', validarListaSorteio, async (req, res) => {
    try {
        const { lista, listas } = req;

        const pares = realizarSorteio(lista.participantes);
        await enviarEmails(pares);

        lista.sorteios.push({
            data: new Date().toISOString(),
            pares: pares.map(({ presenteador, presenteado }) => ({
                presenteador: presenteador.email,
                presenteado: presenteado.email
            }))
        });

        await salvarListas(listas);
        
        res.json({ mensagem: MENSAGENS.SUCESSO.SORTEIO_REALIZADO });
    } catch (erro) {
        console.error('Erro detalhado:', erro);
        res.status(500).json({ erro: MENSAGENS.ERRO.REALIZAR_SORTEIO });
    }
});

// Criar nova lista
app.post('/api/listas', async (req, res) => {
    try {
        const { nome } = req.body;
        const token = gerarToken();
        
        const novaLista = {
            id: token,
            nome,
            dataCriacao: new Date().toISOString(),
            participantes: [],
            sorteios: []
        };
        
        const listas = await lerListas();
        listas.push(novaLista);
        await salvarListas(listas);
        
        res.status(201).json({ 
            token,
            mensagem: MENSAGENS.SUCESSO.LISTA_CRIADA
        });
    } catch (erro) {
        res.status(500).json({ erro: MENSAGENS.ERRO.CRIAR_LISTA });
    }
});

// Rota para informações do ambiente (útil para debugging)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor com log mais informativo
app.listen(PORT, () => {
    console.log(`Servidor rodando em modo ${process.env.NODE_ENV}`);
    console.log(`Porta: ${PORT}`);
});