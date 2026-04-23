const STORAGE_KEY = 'fitpro_data';
const CREDS_KEY = 'fitpro_credentials';
const SESSION_KEY = 'fitpro_session';

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const defaultEspecialistas = [
  { id: '1', nome: 'Dr. Carlos Mendes', especialidade: 'Cardiologista', crm: 'CRM-SP 12345', email: 'carlos.mendes@clinica.com', telefone: '(11) 9999-1234', whatsapp: '5511999991234', endereco: { rua: 'Av. Paulista', numero: '1000', complemento: 'Sala 501', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-100' }, descricao: 'Cardiologista especializado em medicina esportiva com 15 anos de experiência.', valorConsulta: 350, disponibilidade: 'Seg a Sex: 8h-18h', parceiro: true, avaliacao: 4.9, percentualComissao: 10, modeloComissao: 'por_contratacao', observacoesComerciais: '', formasPagamento: ['pix'], createdAt: new Date().toISOString() },
  { id: '2', nome: 'Dra. Ana Lima', especialidade: 'Nutricionista', cfn: 'CFN 54321', email: 'ana.lima@nutri.com', telefone: '(11) 8888-5678', whatsapp: '5511888856789', endereco: { rua: 'Rua Augusta', numero: '500', complemento: '', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP', cep: '01305-000' }, descricao: 'Nutricionista esportiva com foco em emagrecimento e hipertrofia.', valorConsulta: 250, disponibilidade: 'Seg, Qua e Sex: 9h-17h', parceiro: true, avaliacao: 4.8, percentualComissao: 10, modeloComissao: 'por_contratacao', observacoesComerciais: '', formasPagamento: ['pix'], createdAt: new Date().toISOString() },
  { id: '3', nome: 'Dr. Pedro Santos', especialidade: 'Fisioterapeuta', crefito: 'CREFITO-3 98765', email: 'pedro.santos@fisio.com', telefone: '(11) 7777-9012', whatsapp: '5511777790123', endereco: { rua: 'Rua Oscar Freire', numero: '200', complemento: '', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', cep: '01426-000' }, descricao: 'Fisioterapeuta esportivo especializado em reabilitação de atletas.', valorConsulta: 200, disponibilidade: 'Seg a Sab: 7h-19h', parceiro: true, avaliacao: 4.7, percentualComissao: 10, modeloComissao: 'por_contratacao', observacoesComerciais: '', formasPagamento: ['pix'], createdAt: new Date().toISOString() },
  { id: '4', nome: 'Dra. Juliana Costa', especialidade: 'Psicólogo', crp: 'CRP-06 11111', email: 'juliana.costa@psico.com', telefone: '(11) 6666-3456', whatsapp: '5511666634567', endereco: { rua: 'Alameda Santos', numero: '800', complemento: 'Sala 302', bairro: 'Jardim Paulista', cidade: 'São Paulo', estado: 'SP', cep: '01419-000' }, descricao: 'Psicóloga especializada em psicologia do esporte e comportamento alimentar.', valorConsulta: 220, disponibilidade: 'Ter e Qui: 10h-20h', parceiro: false, avaliacao: 4.6, percentualComissao: 0, modeloComissao: 'a_negociar', observacoesComerciais: '', formasPagamento: ['pix'], createdAt: new Date().toISOString() },
];

export const defaultExercicios = [
  { id: 'sys-001', nome: 'Supino Reto com Barra', grupoMuscular: 'Peito', musculosSecundarios: ['Tríceps', 'Ombros'], tipo: 'Força', nivel: 'Intermediário', equipamento: 'Barra', descricao: 'Exercício fundamental para desenvolvimento do peitoral.', execucao: '1. Deite no banco. 2. Segure a barra na largura dos ombros. 3. Desça até o peito e empurre.', dicas: 'Mantenha os pés no chão e a lombar levemente arqueada.', errosComuns: 'Não deixe os cotovelos flarem demais.', series: '3-4', repeticoes: '8-12', descanso: 90, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-002', nome: 'Supino Inclinado com Halteres', grupoMuscular: 'Peito', musculosSecundarios: ['Ombros', 'Tríceps'], tipo: 'Força', nivel: 'Intermediário', equipamento: 'Halteres', descricao: 'Foca na parte superior do peitoral.', execucao: '1. Banco a 30-45°. 2. Halteres na altura do peito. 3. Empurre e controle a descida.', dicas: 'Controle o movimento na descida.', errosComuns: 'Banco muito inclinado ativa mais o ombro.', series: '3-4', repeticoes: '10-12', descanso: 75, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-003', nome: 'Puxada Frontal no Pulley', grupoMuscular: 'Costas', musculosSecundarios: ['Bíceps'], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Cabo', descricao: 'Exercício para o grande dorsal com puxada vertical.', execucao: '1. Sente-se e segure a barra larga. 2. Puxe até o peito. 3. Controle a subida.', dicas: 'Leve o peito à barra, não a barra ao peito.', errosComuns: 'Usar impulso do corpo.', series: '3-4', repeticoes: '10-12', descanso: 75, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-004', nome: 'Remada Curvada com Barra', grupoMuscular: 'Costas', musculosSecundarios: ['Bíceps', 'Core'], tipo: 'Força', nivel: 'Intermediário', equipamento: 'Barra', descricao: 'Exercício composto para espessura das costas.', execucao: '1. Incline o tronco ~45°. 2. Puxe a barra até o abdômen. 3. Controle a descida.', dicas: 'Mantenha as costas retas.', errosComuns: 'Arredondar a lombar.', series: '3-4', repeticoes: '8-10', descanso: 90, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-005', nome: 'Agachamento Livre', grupoMuscular: 'Quadríceps', musculosSecundarios: ['Glúteos', 'Posterior de Coxa', 'Core'], tipo: 'Força', nivel: 'Intermediário', equipamento: 'Barra', descricao: 'O rei dos exercícios para pernas.', execucao: '1. Posicione a barra nas costas. 2. Pés na largura dos ombros. 3. Desça até as coxas paralelas ao chão.', dicas: 'Joelhos na direção dos pés.', errosComuns: 'Joelhos caindo para dentro.', series: '4', repeticoes: '8-12', descanso: 120, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-006', nome: 'Desenvolvimento com Halteres', grupoMuscular: 'Ombros', musculosSecundarios: ['Tríceps'], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Halteres', descricao: 'Exercício básico para deltoides.', execucao: '1. Halteres na altura dos ombros. 2. Empurre acima da cabeça. 3. Controle a descida.', dicas: 'Não trave os cotovelos no topo.', errosComuns: 'Arqueamento excessivo da lombar.', series: '3-4', repeticoes: '10-12', descanso: 75, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-007', nome: 'Rosca Direta com Barra', grupoMuscular: 'Bíceps', musculosSecundarios: ['Antebraço'], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Barra', descricao: 'Exercício clássico para bíceps.', execucao: '1. Segure a barra com pegada supinada. 2. Flexione os cotovelos. 3. Controle a descida.', dicas: 'Cotovelos fixos ao lado do corpo.', errosComuns: 'Balançar o tronco.', series: '3-4', repeticoes: '10-12', descanso: 60, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-008', nome: 'Tríceps Pulley com Corda', grupoMuscular: 'Tríceps', musculosSecundarios: [], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Cabo', descricao: 'Exercício de isolamento para tríceps.', execucao: '1. Segure a corda com pegada neutra. 2. Cotovelos fixos. 3. Estenda até o final.', dicas: 'Abra a corda no final do movimento.', errosComuns: 'Mover os cotovelos.', series: '3-4', repeticoes: '12-15', descanso: 60, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-009', nome: 'Leg Press 45°', grupoMuscular: 'Quadríceps', musculosSecundarios: ['Glúteos', 'Posterior de Coxa'], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Máquina', descricao: 'Exercício fundamental para membros inferiores.', execucao: '1. Posicione os pés na plataforma. 2. Desça controlando. 3. Empurre sem travar os joelhos.', dicas: 'Não trave os joelhos no topo.', errosComuns: 'Tirar o glúteo do banco.', series: '4', repeticoes: '10-15', descanso: 90, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys-010', nome: 'Elevação Lateral com Halteres', grupoMuscular: 'Ombros', musculosSecundarios: [], tipo: 'Força', nivel: 'Iniciante', equipamento: 'Halteres', descricao: 'Isolamento do deltoide lateral.', execucao: '1. Pés na largura dos ombros. 2. Eleve os braços lateralmente até a altura dos ombros.', dicas: 'Leve o polegar levemente para baixo.', errosComuns: 'Usar impulso do corpo.', series: '3-4', repeticoes: '12-15', descanso: 60, videoUrl: '', imagemUrl: '', gifUrl: '', professorId: 'system', publico: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const defaultState = {
  alunos: [],
  professores: [],
  avaliacoes: [],
  planosTreino: [],
  periodizacoes: [],
  planosDieta: [],
  especialistas: defaultEspecialistas,
  exerciciosBiblioteca: defaultExercicios,
  pastasTreino: [],
  rotinasTreino: [],
  transacoes: [],
  produtos: [],
  mensalidades: [],
  planosMensalidade: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const saved = JSON.parse(raw);
    return {
      ...defaultState,
      ...saved,
      especialistas: saved.especialistas?.length ? saved.especialistas : defaultEspecialistas,
      exerciciosBiblioteca: saved.exerciciosBiblioteca?.length ? saved.exerciciosBiblioteca : defaultExercicios,
    };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return null;
  } catch (e) {
    return e.message;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────
function defaultCredentials() {
  return [
    { id: 'admin-1', email: 'admin@fitpro.com', password: 'admin123', role: 'admin', nome: 'Administrador FitPro', ativo: true, autoRegistrado: false },
    { id: 'prof-demo', email: 'professor@fitpro.com', password: 'prof123', role: 'professor', nome: 'Prof. Demo Silva', linkedId: '', ativo: true, autoRegistrado: false },
    { id: 'aluno-demo', email: 'aluno@fitpro.com', password: 'aluno123', role: 'aluno', nome: 'Aluno Demo', linkedId: '', ativo: true, autoRegistrado: false },
  ];
}

export function getCredentials() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (!raw) {
      const defaults = defaultCredentials();
      localStorage.setItem(CREDS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return defaultCredentials();
  }
}

export function saveCredentials(creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

export function addCredential(cred) {
  const creds = getCredentials();
  const newCred = { ...cred, id: Date.now().toString(36) + Math.random().toString(36).substr(2) };
  saveCredentials([...creds, newCred]);
  return newCred;
}

export function updateCredential(id, updates) {
  const creds = getCredentials();
  saveCredentials(creds.map(c => c.id === id ? { ...c, ...updates } : c));
}

export function deleteCredential(id) {
  const creds = getCredentials();
  saveCredentials(creds.filter(c => c.id !== id));
}

export function emailExists(email) {
  return getCredentials().some(c => c.email.toLowerCase() === email.toLowerCase());
}

export function login(email, password) {
  const creds = getCredentials();
  const cred = creds.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password && c.ativo);
  if (!cred) return null;
  const user = { id: cred.id, nome: cred.nome, email: cred.email, role: cred.role, linkedId: cred.linkedId, autoRegistrado: cred.autoRegistrado ?? false };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}