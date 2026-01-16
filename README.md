# TOON CASTLE - Documentação

## 1. Visão Geral

Consiste em um jogo de cartas single-player estilo roguelike. O foco é a subida tática de um torre de 5 andares, onde com sabedoria, paciência juntamente a deck enxuto de 15 cartas, é a chave para a conquista do castelo.

---
## 2. Requisitos funcionais (RF)

Os requisitos funcionais desse projeto tem a finalidade de descrever as ações que o sistema deve permitir que o usuário realize ou que ocorra automaticamente durante o jogo.

| ID       | Requisito                       | Descrição                                                                                                                                |
| -------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **RF01** | **Gestão de Deck**              | O jogador deve possuir um deck fixo de exatamente 20 cartas 🃏.                                                                          |
| **RF02** | **Substituição de Cartas**      | Após vencer um NPC, o jogador escolhe 1 de 3 cartas oferecidas. Para adicioná-la, deve obrigatoriamente remover uma carta atual do deck. |
| **RF03** | **Fluxo de Andares**            | O jogo deve processar 5 níveis do castelo. Cada nível possui 4 NPCs comuns e 1 Chefe final 🏰.                                           |
| **RF04** | **Sistema de Vidas (Corações)** | Gerenciar o sistema de tentativas: Fácil (5), Médio (3) e Difícil (1). Perder um duelo consome um coração 💖.                            |
| **RF05** | **Mecânica de Combate**         | Duelos por turnos baseados em consumo de Energia ⚡. O objetivo é reduzir o HP do oponente a zero.                                        |
| **RF06** | **Gatilho de Armadilha**        | Cartas de armadilha devem ser ativadas automaticamente no momento em que o oponente declara um ataque 🪤.                                |
| **RF07** | **IA de Prioridade**            | O NPC deve avaliar o campo e a própria mão, atribuindo pesos às jogadas para decidir a melhor ação baseada na dificuldade.               |

---
## 3. Requisitos não funcionais (RNF)

Os requisitos não funcionais desse projeto definem os critérios de qualidade do software

| **ID**    | **Requisito**            | **Descrição**                                                                                                  |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **RNF01** | **Tecnologia de Engine** | O jogo deve ser desenvolvido utilizando o framework **Phaser 3** 🎮.                                           |
| **RNF02** | **Lógica e Tipagem**     | Todo o código deve ser escrito em **TypeScript** para garantir segurança de tipos e facilitar a manutenção 💻. |
| **RNF03** | **Estética Visual**      | O estilo artístico deve ser "Toon" (exagerado, cômico).                                                        |
| **RNF04** | **Arquitetura de UI**    | O jogo deve possuir um menu inicial com opções de: Iniciar, Tutorial e Seleção de Dificuldade.                 |

---
## 4. Detalhamento das Regras de Jogo 📝

Nesta seção, especificamos os números que regem o equilíbrio do combate. 
### 4.1. Sistema de Atributos e Dano ⚔️

O combate utiliza o sistema de **Diferença de Pontos** baseado na posição da carta:

- **Modo de Ataque:** O monstro usa seu **ATK**. Se vencer um monstro em ataque, a diferença reduz o HP do oponente.
- **Modo de Defesa:** O monstro usa sua **DEF**. Se for atacado e sua DEF for maior que o ATK inimigo, o atacante recebe o dano da diferença. Se for menor, o monstro é destruído, mas o dono não perde HP.
- **HP Total:** Cada duelista inicia com **6000 pontos de vida** 💔.

### 4.2. Gestão de Energia e Turnos ⚡

- **Mão Inicial:** 5 cartas 🎴.
- **Compra por Turno:** 1 carta.
- **Energia:** O jogador começa com **3 pontos** de energia no turno 1. A energia aumenta em +1 a cada turno (até o máximo de 10).
---
## 5. Tipos de Cartas e Efeitos 🎭

Para ajudar na programação em **TypeScript**, vamos definir o comportamento base de cada tipo:

1. **Monstros:** Unidades principais com valores de ATK/DEF. Podem ter efeitos como: _“Ao ser invocado, compre 1 carta”_.
2. **Mágicas:** Cartas de uso imediato no turno do jogador. Exemplo: _“Aumenta o ataque de um monstro em 500”_.
3. **Armadilhas:** Cartas baixadas com a face para baixo. Ativam sozinhas quando o oponente ataca 🪤. Exemplo: _“Reduz o ataque do monstro atacante pela metade”_.

---
## 6. Inteligência Artificial (IA) de Prioridade

Nesta seção, detalhamos como a inteligência artificial processa as decisões do NPC com base no nível de dificuldade escolhida pelo jogador no menu inicial.

|**Nível**|**Perfil de Comportamento**|**Estratégia de Decisão**|
|---|---|---|
|**Fácil**|**Agressivo Impulsivo**|Prioriza o gasto total de energia no turno. Ataca sempre que possuir um monstro com ATK superior à DEF/ATK do alvo, sem considerar possíveis armadilhas. 🟢|
|**Médio**|**Reativo Estratégico**|Utiliza a **Prioridade Reativa**. Se possuir uma armadilha na mão, pode invocar monstros fracos em modo de ataque para servir de isca. Tenta manter reserva de energia para turnos críticos. 🟡|
|**Difícil**|**Estrategista Profissional**|Analisa o estado do cemitério e do campo. Calcula o custo-benefício de cada troca e só ataca quando possui "rede de segurança" (outros monstros ou armadilhas de proteção). 🔴|

---
## 7. Interface e Tabuleiro (Layout Phaser 3) 🏟️

O layout da cena de batalha é fixo e dividido em zonas de interação para otimizar a experiência em dispositivos desktop e mobile.

**Zonas de Campo (Slots):**
- **Monstros:** 3 slots centrais para cada lado.
- **Suporte (Magias/Armadilhas):** 3 slots logo abaixo (ou acima, para o NPC) dos monstros.

**Gestão de Recursos:**
- **Barra Superior:** Exibe o HP (6000) e o nome do NPC/Jogador.
- **Lado Direito Inferior:** Pilha de Deck (20 cartas) com contador numérico.
- **Lado Esquerdo Inferior:** Indicador de Energia ⚡ (exemplo: `Energia Atual: 3/3`).
- **Centro Inferior:** Mão do jogador (inicial de 5 cartas).

---
### 8. Fluxo de Navegação e Estados 🏰

O jogo segue um fluxo linear e contínuo, inspirado em sistemas de _battle-rush_.

1. **Cena de Preparação:** Exibe o deck atual e o botão "Preparado para o Castelo".
2. **Cena de Batalha:** Ciclo de 4 fases (Compra ➡️ Principal ➡️ Batalha ➡️ Final).
3. **Cena de Resultado:**
	- **Vitória:** Transição direta para a **Tela de Recompensa** (Escolha 1 de 3 cartas ocultas + substituição obrigatória).
    - **Derrota:** Consome 1 Coração 💖. Se restarem corações, permite revanche; caso contrário, executa o Reset total do progresso (Game Over).

---
## 9. Máquina de Estados: Fases da Batalha

Cada turno é dividido em 4 estados obrigatórios. O sistema bloqueia ações que não pertencem à fase atual para evitar erros de lógica.

| **Fase**                | **Ações Permitidas**                                 | **Regras Automáticas**                                                                                               |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **1. Compra (Draw)**    | Nenhuma (Ação do Sistema).                           | O sistema retira 1 carta do Deck 🎴 e adiciona à Mão. Se o Deck estiver vazio, o Cemitério é embaralhado.            |
| **2. Principal (Main)** | Invocar Monstros; Ativar Mágicas; Baixar Armadilhas. | O jogador gasta Energia ⚡. Só podes invocar se houver slots de monstro (máx. 3) disponíveis.                         |
| **3. Batalha (Battle)** | Declarar Ataques ⚔️.                                 | Ao atacar, o sistema verifica se o oponente tem Armadilhas 🪤. Se sim, o gatilho é ativado antes do cálculo de dano. |
| **4. Final (End)**      | Nenhuma.                                             | Efeitos temporários (ex: "ganha +500 ATK até ao fim do turno") expiram. A vez passa para o oponente.                 |

---
## 10. Lógica de Reciclagem e Cemitério ⚰️

Como o jogo utiliza um deck enxuto de 20 cartas, a gestão do descarte é vital para evitar que o duelo trave.
- **Fluxo de Descarte:** Cartas de Mágica usadas, Armadilhas ativadas e Monstros destruídos são movidos para o **Cemitério**.
- **Condição de Reembaralhamento:** Caso o jogador precise comprar uma carta e o deck esteja com 0 unidades, o sistema move todas as cartas do Cemitério de volta para o Deck e executa a função `shuffle()`.
- **Interatividade:** O jogador pode clicar na pilha do Cemitério para visualizar as cartas descartadas (ajuda na tomada de decisão estratégica).

---
## 11. Escalonamento de Dificuldade da Torre 🗼

Como é um roguelike, os inimigos precisam ficar mais fortes conforme o jogador sobe os andares.
- **Andares 1-2:** NPCs utilizam decks básicos com monstros de ATK entre 800 e 1500.
- **Andares 3-4:** NPCs começam a usar Cartas de Efeito e Armadilhas mais complexas.
- **Andar 5 (Topo):** O Chefe Final possui cartas exclusivas com custos de energia reduzidos ou ATK superior a 2500.

---
## 12. Sistema de Recompensas e Raridades 🎁

Após cada vitória contra um NPC, o jogador acessa a **Tela de Recompensa**, onde o sistema gera 3 opções de cartas baseadas na "Tabela de Probabilidade" do andar atual.

### 12.1. Categorias de Raridade

- **Comum (C):** Cartas básicas de suporte e monstros de nível baixo. ⚪
- **Rara (R):** Monstros de efeito inicial e mágicas de utilidade. 🔵
- **Épica (E):** Monstros de custo 3+ e armadilhas devastadoras. 🟣
- **Lendária (L):** Cartas exclusivas de recompensa, com efeitos que podem mudar o rumo do duelo. 🟡
### 12.2. Tabela de Probabilidades por Andar 📈

|**Andar**|**Comum**|**Rara**|**Épica**|**Lendária**|
|---|---|---|---|---|
|**1**|70%|25%|5%|0%|
|**2**|50%|35%|15%|0%|
|**3**|20%|50%|25%|5%|
|**4**|5%|40%|40%|15%|
|**5**|0%|20%|50%|30%|
### 12.3. Cartas Exclusivas de Recompensa (Drop-Only) 🔒

Estas cartas **não podem** fazer parte do deck inicial do jogador. Elas servem como incentivo para a subida da torre.
- **Exemplo:** _“Mestre Toon do Castelo”_ (Lendária) – Só aparece como recompensa nos andares 4 ou 5.

---
## 13. Interface de Troca de Cartas (UX/UI) ⚖️

Quando o jogador seleciona uma das 3 cartas de recompensa, o jogo entra no **Modo de Substituição**. O objetivo é garantir que o deck permaneça com exatamente **20 cartas**.

### 13.1. Funcionalidade de Comparação Direta

A tela será dividida para facilitar a análise:

- **Lado Esquerdo (Nova Carta):** Exibe a recompensa escolhida com destaque (animações de brilho conforme a raridade: Comum ⚪, Rara 🔵, Épica 🟣, Lendária 🟡).
- **Lado Direito (Deck Atual):** Uma lista rolável ou grade com as 20 cartas atuais do jogador.
- **Painel Central (Comparativo):** Ao clicar em uma carta do deck atual, ela é posicionada ao lado da nova carta. O sistema destaca as diferenças de atributos (ex: se o ATK da nova for maior, o número aparece em verde 🟢).

### 13.2. Fluxo Lógico no TypeScript

1. O sistema armazena a `NovaCarta` em uma variável temporária.
2. O jogador seleciona a `CartaParaRemover` do array `playerDeck`.
3. Ao confirmar, o código executa:
    - `playerDeck.splice(indexRemocao, 1);`
    - `playerDeck.push(NovaCarta);`
4. O sistema salva o novo estado do deck e prossegue para o próximo andar da torre.

---
## 14. Regras de Exceção e Condições de Vitória ⚖️

Para garantir a consistência do jogo e o desafio do estilo _roguelike_, as seguintes regras de sistema foram estabelecidas:

### 14.1. Resolução de Empates (Tie-break) ⚔️

- Quando dois monstros em **Modo de Ataque** possuem o mesmo valor de **ATK**, ambos são destruídos e enviados para o cemitério.
- Nenhum dano é subtraído do HP de ambos os jogadores nesta situação.

### 14.2. Condições de Game Over e Reset 💀

- O jogo termina quando os **Corações (Vidas)** do jogador chegam a 0.
- **Fluxo de Reset:** O jogador é direcionado para a tela de _Game Over_, onde a opção "Recomeçar" limpa o progresso atual, reseta o deck para a configuração inicial e retorna o jogador ao Menu Principal.

### 14.3. Gerenciamento de Deck Out 🎴

- O jogo foi balanceado para que o duelo termine antes do esgotamento total de recursos. No entanto, se o Deck e o Cemitério estiverem vazios simultaneamente e o jogador precisar comprar uma carta, ele não poderá realizar a ação (o que pode levar a uma derrota estratégica).

---
## 15. Padronização Visual (Assets) 🎨

- **Verso das Cartas:** Todas as cartas (Jogador e NPC) utilizam o mesmo design de verso. Isso garante o mistério sobre as cartas "Setadas" (armadilhas ou monstros ocultos) do oponente.
- **Feedback Visual:** As cartas devem possuir estados visuais claros para: _Modo de Ataque (Vertical)_, _Modo de Defesa (Horizontal)_ e _Carta Oculta (Verso para cima)_.
