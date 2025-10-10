import { Node, Edge } from '@xyflow/react';

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: 'basic-support',
    name: 'Atendimento Básico',
    description: 'Flow simples de boas-vindas e coleta de informações',
    category: 'Suporte',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Início', trigger: 'first_message' },
      },
      {
        id: '2',
        type: 'message',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Boas-vindas', 
          message: 'Olá! Como posso ajudar você hoje?',
          type: 'text'
        },
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 250, y: 250 },
        data: { 
          label: 'Verificar Tipo', 
          variable: 'mensagem',
          operator: 'contains',
          value: 'suporte'
        },
      },
      {
        id: '4',
        type: 'agent',
        position: { x: 100, y: 350 },
        data: { 
          label: 'Delegar Suporte',
          agentName: 'Agente de Suporte',
          maxTurns: 10
        },
      },
      {
        id: '5',
        type: 'message',
        position: { x: 400, y: 350 },
        data: { 
          label: 'Vendas', 
          message: 'Vou transferir você para nossa equipe de vendas!',
          type: 'text'
        },
      },
      {
        id: '6',
        type: 'end',
        position: { x: 250, y: 450 },
        data: { label: 'Fim', action: 'mark_resolved' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: 'sim' },
      { id: 'e3-5', source: '3', target: '5', label: 'não' },
      { id: 'e4-6', source: '4', target: '6' },
      { id: 'e5-6', source: '5', target: '6' },
    ],
  },
  {
    id: 'lead-qualification',
    name: 'Qualificação de Leads',
    description: 'Coleta informações e qualifica leads automaticamente',
    category: 'Vendas',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Início', trigger: 'keyword', keyword: 'interesse' },
      },
      {
        id: '2',
        type: 'message',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Coletar Nome', 
          message: 'Qual é o seu nome?',
          type: 'text'
        },
      },
      {
        id: '3',
        type: 'variable',
        position: { x: 250, y: 250 },
        data: { 
          label: 'Salvar Nome',
          variableName: 'lead.nome',
          operation: 'set',
          value: '{{ultima_mensagem}}'
        },
      },
      {
        id: '4',
        type: 'message',
        position: { x: 250, y: 350 },
        data: { 
          label: 'Coletar Email', 
          message: 'Qual é o seu email?',
          type: 'text'
        },
      },
      {
        id: '5',
        type: 'ai',
        position: { x: 250, y: 450 },
        data: { 
          label: 'Qualificar Lead',
          model: 'gpt-4',
          prompt: 'Analise se este é um lead qualificado baseado nas respostas',
          temperature: 0.7,
          maxTokens: 200,
          saveResponseTo: 'lead_score'
        },
      },
      {
        id: '6',
        type: 'end',
        position: { x: 250, y: 550 },
        data: { label: 'Fim', action: 'webhook', actionConfig: { webhookUrl: '/api/leads' } },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
    ],
  },
  {
    id: 'appointment-scheduling',
    name: 'Agendamento de Consulta',
    description: 'Agenda consultas e envia confirmações',
    category: 'Agendamentos',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Início', trigger: 'keyword', keyword: 'agendar' },
      },
      {
        id: '2',
        type: 'message',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Verificar Disponibilidade', 
          message: 'Que dia você prefere?',
          type: 'text'
        },
      },
      {
        id: '3',
        type: 'http',
        position: { x: 250, y: 250 },
        data: { 
          label: 'Verificar Agenda',
          url: 'https://api.exemplo.com/availability',
          method: 'GET',
          headers: {},
          timeout: 5000,
          saveResponseTo: 'disponibilidade'
        },
      },
      {
        id: '4',
        type: 'condition',
        position: { x: 250, y: 350 },
        data: { 
          label: 'Tem Vaga?',
          variable: 'disponibilidade.slots',
          operator: '>',
          value: 0
        },
      },
      {
        id: '5',
        type: 'message',
        position: { x: 100, y: 450 },
        data: { 
          label: 'Confirmar', 
          message: 'Ótimo! Sua consulta foi agendada para {{data_escolhida}}',
          type: 'text'
        },
      },
      {
        id: '6',
        type: 'message',
        position: { x: 400, y: 450 },
        data: { 
          label: 'Sem Vagas', 
          message: 'Desculpe, não temos vagas para essa data. Posso sugerir outra?',
          type: 'text'
        },
      },
      {
        id: '7',
        type: 'end',
        position: { x: 250, y: 550 },
        data: { label: 'Fim', action: 'add_tag', actionConfig: { tag: 'agendado' } },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', label: 'sim' },
      { id: 'e4-6', source: '4', target: '6', label: 'não' },
      { id: 'e5-7', source: '5', target: '7' },
      { id: 'e6-2', source: '6', target: '2' },
    ],
  },
];

export const getTemplatesByCategory = (category: string) => {
  return flowTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return flowTemplates.find(t => t.id === id);
};
