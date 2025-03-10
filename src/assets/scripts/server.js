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
const ARQUIVO_USUARIOS = join(__dirname, '../../data/usuarios.json');

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

// Adicione estas variáveis de armazenamento em memória
let listasEmMemoria = { listas: [] };
let usuariosEmMemoria = { usuarios: [] };

async function lerListas() {
    // Em produção, usamos a memória
    if (process.env.NODE_ENV === 'production') {
        console.log('Lendo listas da memória (prod)', listasEmMemoria.listas.length);
        return listasEmMemoria.listas;
    }

    // Em desenvolvimento, usamos os arquivos
    try {
        const dados = await fs.readFile(ARQUIVO_LISTAS, 'utf8');
        return JSON.parse(dados).listas;
    } catch (erro) {
        console.error(MENSAGENS.ERRO.LER_LISTA, erro);
        return [];
    }
}

async function salvarListas(listas) {
    // Em produção, salvamos na memória
    if (process.env.NODE_ENV === 'production') {
        console.log('Salvando listas na memória (prod)', listas.length);
        listasEmMemoria.listas = listas;
        return;
    }

    // Em desenvolvimento, salvamos nos arquivos
    try {
        await fs.writeFile(ARQUIVO_LISTAS, JSON.stringify({ listas }, null, 2));
    } catch (erro) {
        console.error(MENSAGENS.ERRO.SALVAR_LISTA, erro);
        throw erro;
    }
}

async function lerUsuarios() {
    // Em produção, usamos a memória
    if (process.env.NODE_ENV === 'production') {
        console.log('Lendo usuários da memória (prod)', usuariosEmMemoria.usuarios.length);
        return usuariosEmMemoria.usuarios;
    }

    // Em desenvolvimento, usamos os arquivos
    try {
        const dados = await fs.readFile(ARQUIVO_USUARIOS, 'utf8');
        return JSON.parse(dados).usuarios;
    } catch (erro) {
        console.error('Erro ao ler usuários:', erro);
        return [];
    }
}

async function salvarUsuarios(usuarios) {
    // Em produção, salvamos na memória
    if (process.env.NODE_ENV === 'production') {
        console.log('Salvando usuários na memória (prod)', usuarios.length);
        usuariosEmMemoria.usuarios = usuarios;
        return;
    }

    // Em desenvolvimento, salvamos nos arquivos
    try {
        await fs.writeFile(ARQUIVO_USUARIOS, JSON.stringify({ usuarios }, null, 2));
    } catch (erro) {
        console.error('Erro ao salvar usuários:', erro);
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

// No início de rotas importantes, adicione logs para depuração
app.post('/api/usuarios/login', async (req, res) => {
    console.log('API: Login iniciado', req.body);
    
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ erro: MENSAGENS.ERRO.VALIDACAO.EMAIL_VAZIO });
        }
        
        let usuarios = await lerUsuarios();
        let usuario = usuarios.find(u => u.email === email);
        
        const timestamp = new Date().toISOString();
        const isNovoUsuario = !usuario;
        
        // Se o usuário não existir, cria um novo
        if (isNovoUsuario) {
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            usuario = {
                email,
                token,
                dataCriacao: timestamp,
                ultimoLogin: timestamp,
                listas: []
            };
            usuarios.push(usuario);
        } else {
            // Atualiza data de último login
            usuario.ultimoLogin = timestamp;
            if (!usuario.token) {
                usuario.token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
        }
        
        await salvarUsuarios(usuarios);
        
        // Se for novo usuário ou não tiver listas, cria uma lista inicial
        if (isNovoUsuario || usuario.listas.length === 0) {
            // Cria uma lista inicial com o mesmo token do usuário
            const listaToken = usuario.token;
            const nomeLista = `Lista de ${email.split('@')[0]}`;
            
            const listas = await lerListas();
            const novaLista = {
                id: listaToken,
                nome: nomeLista,
                dataCriacao: timestamp,
                participantes: [],
                sorteios: []
            };
            
            listas.push(novaLista);
            await salvarListas(listas);
            
            // Associa a lista ao usuário
            usuario.listas.push(listaToken);
            await salvarUsuarios(usuarios);
        }
        
        res.json({
            email: usuario.email,
            token: usuario.token,
            dataCriacao: usuario.dataCriacao
        });
    } catch (erro) {
        console.error('Erro no login:', erro);
        res.status(500).json({ erro: MENSAGENS.ERRO.LOGIN_FALHOU });
    }
});

// Rota para obter listas do usuário - melhoria para retornar listas existentes
app.get('/api/usuarios/:token/listas', async (req, res) => {
    console.log('API: Obtendo listas do usuário', req.params.token);
    
    try {
        const { token } = req.params;
        
        const usuarios = await lerUsuarios();
        const usuario = usuarios.find(u => u.token === token);
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        const todasListas = await lerListas();
        
        // Filtra listas do usuário
        const listasDoUsuario = todasListas.filter(
            lista => usuario.listas.includes(lista.id)
        );
        
        // Se o usuário não tiver listas, retorna array vazio
        // (não deveria acontecer com as alterações no login)
        if (listasDoUsuario.length === 0) {
            console.log(`Usuário ${usuario.email} não tem listas associadas`);
        }
        
        res.json(listasDoUsuario);
    } catch (erro) {
        console.error('Erro ao obter listas do usuário:', erro);
        res.status(500).json({ erro: MENSAGENS.ERRO.CARREGAR_LISTAS_USUARIO });
    }
});

// Modificar a rota de criar lista para associar ao usuário corretamente
app.post('/api/listas', async (req, res) => {
    try {
        const { nome, userToken } = req.body;
        
        if (!nome) {
            return res.status(400).json({ erro: 'Nome da lista é obrigatório' });
        }
        
        if (!userToken) {
            return res.status(400).json({ erro: 'Token de usuário é obrigatório' });
        }
        
        // Gera token para a lista
        const token = gerarToken();
        
        const novaLista = {
            id: token,
            nome,
            dataCriacao: new Date().toISOString(),
            participantes: [],
            sorteios: []
        };
        
        // Adiciona a lista ao arquivo de listas
        const listas = await lerListas();
        listas.push(novaLista);
        await salvarListas(listas);
        
        // Associa a lista ao usuário
        const usuarios = await lerUsuarios();
        const usuario = usuarios.find(u => u.token === userToken);
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        usuario.listas.push(token);
        await salvarUsuarios(usuarios);
        
        res.status(201).json({ 
            token,
            mensagem: MENSAGENS.SUCESSO.LISTA_CRIADA
        });
    } catch (erro) {
        console.error('Erro ao criar lista:', erro);
        res.status(500).json({ erro: MENSAGENS.ERRO.CRIAR_LISTA });
    }
});

// Rotas existentes...
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

// Adicionar esta nova rota para excluir listas
app.delete('/api/listas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const authorization = req.headers.authorization;
        
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ erro: 'Não autorizado' });
        }
        
        const userToken = authorization.split(' ')[1];
        
        // Verificar se o usuário existe
        const usuarios = await lerUsuarios();
        const usuario = usuarios.find(u => u.token === userToken);
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        // Verificar se a lista pertence ao usuário
        if (!usuario.listas.includes(id)) {
            return res.status(403).json({ erro: 'Você não tem permissão para remover esta lista' });
        }
        
        // Remover a lista do arquivo listas.json
        const listas = await lerListas();
        const indexLista = listas.findIndex(l => l.id === id);
        
        if (indexLista === -1) {
            return res.status(404).json({ erro: 'Lista não encontrada' });
        }
        
        listas.splice(indexLista, 1);
        await salvarListas(listas);
        
        // Remover a lista da lista de listas do usuário
        usuario.listas = usuario.listas.filter(listaId => listaId !== id);
        await salvarUsuarios(usuarios);
        
        res.json({ mensagem: 'Lista removida com sucesso' });
    } catch (erro) {
        console.error('Erro ao remover lista:', erro);
        res.status(500).json({ erro: 'Não foi possível remover a lista' });
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

// Adicione isso no seu servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    listsInMemory: listasEmMemoria.listas.length,
    usersInMemory: usuariosEmMemoria.usuarios.length,
    timestamp: new Date().toISOString()
  });
});

// Inicializar com dados padrão para produção
async function inicializarDadosProducao() {
    if (process.env.NODE_ENV === 'production') {
        console.log('Inicializando dados padrão para produção');

        // Se não houver dados em memória ainda, crie exemplos
        if (!listasEmMemoria.listas || listasEmMemoria.listas.length === 0) {
            listasEmMemoria.listas = [
                {
                    id: "token_demo_lista",
                    nome: "Lista de Demonstração",
                    dataCriacao: new Date().toISOString(),
                    participantes: [],
                    sorteios: []
                }
            ];
        }

        if (!usuariosEmMemoria.usuarios || usuariosEmMemoria.usuarios.length === 0) {
            usuariosEmMemoria.usuarios = [
                {
                    email: "demo@exemplo.com",
                    token: "token_demo_usuario",
                    dataCriacao: new Date().toISOString(),
                    ultimoLogin: new Date().toISOString(),
                    listas: ["token_demo_lista"]
                }
            ];
        }
    }
}

// Iniciar servidor com log mais informativo
inicializarDadosProducao().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em modo ${process.env.NODE_ENV}`);
        console.log(`Porta: ${PORT}`);
    });
});