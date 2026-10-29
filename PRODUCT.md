# Produto: RideOps

## Visão

Um diário privado de ciclismo: registrar pedaladas e transformar arquivos GPX em trajetos e métricas confiáveis. O objetivo é um produto de portfólio que também seja útil no dia a dia.

## MVP

Um usuário consegue criar conta, entrar, registrar e editar um pedal manual, importar um GPX válido, visualizar seu trajeto e consultar totais por período. Nenhuma dessas ações permite acesso a dados de outro usuário.

### Fluxos principais

1. **Pedal manual:** criar conta → entrar → cadastrar título, início e distância, com duração opcional → consultar histórico → editar ou excluir.
2. **Importação:** selecionar GPX → validar → calcular métricas → persistir atividade e trilha → abrir detalhes com mapa. Arquivos inválidos geram erros previsíveis; duplicatas não criam outra atividade.
3. **Evolução:** selecionar período → consultar distância, duração conhecida e quantidade de atividades → abrir um pedal do histórico.

## Termos do domínio

- **Usuário:** proprietário de suas atividades, com email, senha protegida e timezone.
- **Pedalada (Ride):** atividade de origem `MANUAL` ou `GPX`, pertencente a um único usuário.
- **Trilha (Track):** sequência ordenada de pontos GPS associada a uma pedalada importada.
- **Segmento:** conjunto contínuo de pontos no GPX; segmentos distintos não são conectados artificialmente.
- **Importação:** registro do processamento de um arquivo, incluindo checksum, resultado e eventual erro.

## Unidades, datas e métricas

- Banco e API usam metros para distância e elevação e segundos para duração. A interface converte distância para km e velocidade para km/h.
- Instantes são persistidos em UTC. O timezone IANA do usuário orienta entrada e exibição de datas; o cadastro deverá capturar esse timezone.
- Períodos são intervalos `[from, to)`: início inclusivo e fim exclusivo. Limites escolhidos em datas locais são convertidos para UTC antes da consulta.
- Distância e demais medições numéricas devem ser finitas e não negativas.
- Valor ausente é `null`, nunca zero inventado. A interface mostra “não disponível”. Zero representa uma medição conhecida igual a zero.
- Pedais manuais exigem título não vazio, início e distância. Duração, ganho de elevação e notas são opcionais. Não possuem trilha GPS; métricas informadas pelo usuário não são apresentadas como calculadas por GPS.
- Distância GPX é a soma de Haversine entre pontos consecutivos do mesmo segmento. Latitude fica em `[-90, 90]` e longitude em `[-180, 180]`.
- Duração GPX representa tempo decorrido, não tempo em movimento. Sem timestamps suficientes e válidos, a duração é `null`; a política para timestamps inconsistentes será detalhada no parser.
- Velocidade média é calculada somente quando distância e duração são conhecidas e duração é maior que zero. Tempo em movimento fica fora do MVP.
- Sem elevação, ganho é `null`. Ganho calculado por GPS fica indisponível até existir filtro de ruído documentado e testado. Isso não impede informar ganho manualmente.
- Totais somam apenas medições conhecidas. A interface distingue um total parcial de um total completo; um período com atividades sem nenhuma duração conhecida não exibe zero horas como medição. Um período sem atividades tem contagem e distância total zero.

## Integridade e privacidade

- Todas as atividades são privadas. Leitura, alteração, exclusão, importação e agregações respeitam o proprietário.
- O mesmo arquivo, identificado por SHA-256, não cria duas pedaladas para o mesmo usuário após importação concluída. Usuários diferentes podem importar o mesmo arquivo.
- Persistência da atividade importada, trilha e pontos é transacional. Erros não deixam atividades parcialmente importadas.
- Limite inicial de upload: 5 MB. Limite de pontos será configurável e definido no ticket de upload.
- Senhas, tokens, conteúdo GPX e coordenadas não aparecem em logs normais.

## Fora do MVP

Feed social, seguidores, desafios, GPS ao vivo, integração automática com Strava/Garmin, IA, sensores, pagamentos e compartilhamento público de localização. Filas, worker, recordes, metas, moving time e exportação são evoluções posteriores.

## Critérios de pronto do MVP

- Os três fluxos principais funcionam com dados persistidos e autenticação.
- Um usuário não consulta nem modifica dados de outro, incluindo trilhas e agregados.
- GPX válido produz rota e métricas coerentes; inválidos e duplicados têm tratamento verificável.
- Ausência de métricas não é mascarada como zero; segmentos não são unidos no cálculo ou no mapa.
- Telas centrais funcionam em mobile e apresentam carregamento, vazio e erro.
- Testes cobrem regras centrais e fluxos essenciais; lint, typecheck e build passam.

## Riscos e decisões futuras

- GPS ruidoso e timestamps incompletos: documentar políticas e testar fixtures no parser e cálculo de métricas.
- Localização sensível: testar autorização por proprietário e evitar exposição em logs.
- Timezone e virada de mês: testar limites de períodos nas agregações.
- Provedor de mapas: selecionar antes do mapa, documentando atribuição, limites e custos.
- Sessão, CSRF e hashing: decidir na implementação de autenticação, antes de disponibilizar rotas privadas.
- Hospedagem e recuperação: decidir na fase de entrega, sem antecipar infraestrutura distribuída.

## Verificação de RO-001

- [x] MVP, fora de escopo e três fluxos principais descritos.
- [x] Metros, segundos e UTC definidos explicitamente.
- [x] Política de métricas ausentes e pedais manuais definida.

Validação: revisão documental dos três critérios. Testes automatizados não se aplicam a esta entrega; ainda não há código executável.
