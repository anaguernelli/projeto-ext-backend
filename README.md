# Pizzaria 404 - Guia do Avaliador (Web Back-end)

Este documento descreve a arquitetura, as tecnologias e a estrutura de componentes da interface do projeto Pizzaria 404, além de detalhar o processo de execução local via Makefile. O projeto foi projetado com uma arquitetura desacoplada, utilizando um backend em Flask que atua como API RESTful e serve os arquivos estáticos do frontend construído em React.

---

## Stack Tecnológica do Back-end

O back-end da Pizzaria 404 foi desenvolvido em **Python**, utilizando o framework **Flask** para implementar uma API REST responsável por processar as requisições, executar as regras de negócio e realizar a comunicação entre a interface do usuário e os dados da aplicação.

### Tecnologias Utilizadas

- **Python:** linguagem de programação utilizada para implementar a lógica do servidor e as funcionalidades do sistema.
- **Flask:** framework responsável pela criação do servidor e das rotas da API REST.
- **SQLite:** banco de dados utilizado para armazenar informações relacionadas aos usuários, produtos e pedidos.
- **Flask-CORS:** biblioteca que permite configurar o compartilhamento de recursos entre diferentes origens, facilitando a comunicação entre o front-end e o back-end durante o desenvolvimento.
- **PyJWT:** biblioteca utilizada para trabalhar com tokens JWT (*JSON Web Tokens*), empregados na autenticação e no controle de acesso às funcionalidades protegidas.
- **Cryptography:** biblioteca que disponibiliza recursos para operações criptográficas.

### API REST

A aplicação disponibiliza endpoints HTTP que permitem ao front-end consultar informações e solicitar operações ao back-end. As respostas da API são retornadas em formato JSON, permitindo que os dados sejam processados e apresentados pela interface desenvolvida em React.

Entre as principais funcionalidades disponibilizadas pela API, destacam-se:

- **Autenticação de usuários:** cadastro, login e logout.
- **Consulta ao cardápio:** listagem de produtos disponíveis e opções de personalização das pizzas.
- **Gerenciamento do carrinho:** consulta dos itens adicionados e inclusão ou remoção de produtos.
- **Gerenciamento de pedidos:** finalização de compras, consulta de detalhes, histórico e acompanhamento de status.
- **Cupons e avaliações:** validação de cupons de desconto e consulta ou registro de avaliações.
- **Administração:** gerenciamento de produtos, pedidos, cupons e métricas de vendas, conforme as permissões de acesso.

### Principais Endpoints

| Método HTTP | Endpoint | Finalidade |
|---|---|---|
| POST | `/api/cadastro` | Cadastrar um usuário |
| POST | `/api/login` | Autenticar um usuário |
| GET | `/api/produtos` | Consultar os produtos disponíveis |
| GET | `/api/carrinho` | Consultar o carrinho do usuário autenticado |
| POST | `/api/pedido` | Adicionar um item ao pedido |
| POST | `/api/pedido/finalizar` | Finalizar um pedido |
| GET | `/api/pedidos/historico` | Consultar o histórico de pedidos |
| GET | `/api/avaliacoes` | Consultar avaliações |

### Organização do Back-end

O código foi organizado em módulos com responsabilidades distintas, favorecendo a separação das funcionalidades e a manutenção do sistema:

- **Routes:** define os endpoints e direciona as requisições para os componentes responsáveis pelo processamento.
- **Controllers:** recebem as requisições e coordenam o tratamento das operações.
- **Services:** concentram as regras de negócio da aplicação.
- **Repositories:** realizam a comunicação com o banco de dados SQLite.
- **Security:** contém mecanismos de autenticação e controle de acesso, incluindo a validação de tokens JWT.

Essa organização permite separar a comunicação HTTP, as regras de negócio e o acesso aos dados, tornando o código mais organizado e facilitando futuras melhorias na aplicação.

## Stack Tecnológica do Frontend

O frontend foi desenvolvido utilizando tecnologias modernas para garantir performance, tipagem estática segura e uma experiência de usuário fluida.

* **Core:** React 19 e TypeScript
* **Ferramenta de Build:** Vite
* **Roteamento:** React Router DOM 7
* **Estilização:** Bootstrap 5 (via CDN para estrutura de layout responsivo) e CSS customizado (para identidade visual e animações)
* **Ícones:** Lucide React e FontAwesome 6

---

## Estratégia de Componentes e Estrutura de Pastas

O diretório `frontend_react/src` está organizado de forma a separar responsabilidades e otimizar a reutilização de código:

```text
frontend_react/src/
├── assets/         # Recursos estáticos locais
├── components/     # Componentes estruturais e reutilizáveis (Layout, Navbar, Footer)
├── context/        # Provedores de estado global (AuthContext, CartContext)
├── pages/          # Páginas que representam as rotas da aplicação
├── types/          # Definições de interfaces do TypeScript
├── App.css         # Estilos específicos da estrutura do aplicativo
├── App.tsx         # Configuração de rotas e provimento de contextos
├── index.css       # Design System, variáveis de estilo e animações globais
└── main.tsx        # Ponto de entrada do React
```

### Componentes de Layout e Navegação
* **Layout.tsx:** Envolve todas as páginas da aplicação, fornecendo uma estrutura de grid flexível flex-column e injetando o plano de fundo dinâmico de brasas/fagulhas animadas.
* **Navbar.tsx:** Menu superior responsivo com links condicionais baseados no estado do usuário (Visitante, Cliente ou Administrador). Inclui o contador visual de itens no carrinho com animação de escala quando atualizado.
* **Footer.tsx:** Rodapé simplificado integrado ao tema escuro da aplicação.

### Gerenciamento de Estado Global (Context API)
* **AuthContext.tsx:** Gerencia o ciclo de autenticação do usuário. Realiza a persistência do token JWT no `localStorage`, valida a sessão atual no endpoint `/api/me` e disponibiliza funções globais de login, cadastro e logout.
* **CartContext.tsx:** Centraliza a lógica do carrinho de compras. Gerencia a busca do carrinho via API (`/api/carrinho`), a adição de pizzas com personalizações (tamanho, borda e ingredientes adicionais), a remoção de itens e a finalização da compra (checkout).

### Páginas do Sistema (`pages/`)
* **Home.tsx:** Página inicial com seção de destaque (Hero) e apresentação da marca.
* **Menu.tsx:** Cardápio dinâmico que carrega as pizzas da API do backend. Permite a seleção de tamanho (P, M, G), tipos de borda (Tradicional, Fina, Recheada) e ingredientes extras.
* **CartCheckout.tsx:** Página de revisão do pedido com cálculo de frete, aplicação de cupons de desconto, preenchimento de endereço e seleção da forma de pagamento.
* **OrdersTracking.tsx:** Acompanhamento em tempo real do status dos pedidos efetuados pelo cliente.
* **AdminDashboard.tsx:** Painel de controle para gerenciar pedidos pendentes e em preparo, permitindo que administradores alterem o status dos pedidos ou gerenciem cupons.
* **Login.tsx e Register.tsx:** Telas de acesso e cadastro com validações de formulário.

---

## Pontos Fortes do Frontend

* **Aesthetics & Dark Mode:** Identidade visual premium baseada em tons escuros e dourado (paleta HSL), com uso consistente de *glassmorphism* (cartões translúcidos usando `backdrop-filter: blur(12px)` e bordas sutis).
* **Animações Fluidas em CSS:** Fundo animado interativo simulando brasas de um forno a lenha subindo lentamente. Efeitos de transição suave e brilho ao passar o mouse sobre os cards de pizzas.
* **Experiência do Usuário e Feedback Visual:** Utilização de Skeleton Loaders durante o carregamento de dados da API para evitar variações bruscas de layout (Cumulative Layout Shift - CLS).
* **Roteamento Dinâmico e Controle de Acesso:** Proteção de rotas com base no papel do usuário (por exemplo, a rota `/admin` só é renderizada se o usuário autenticado tiver privilégios administrativos).

---

## Pré-requisitos para Execução Local

Antes de iniciar, certifique-se de ter os seguintes programas instalados na sua máquina:

* Python (versão 3.8 ou superior)
* Node.js (versão 18 ou superior) e gerenciador de pacotes npm
* Ferramenta `make` (comum em sistemas Linux e macOS; no Windows, recomenda-se usar o Git Bash ou subsistema correspondente para compatibilidade com o Makefile)

---

## Instruções de Execução Local via Makefile

O arquivo `Makefile` localizado na raiz do projeto centraliza os comandos de automação para facilitar o trabalho do avaliador.

### 1. Instalar as Dependências
Execute o comando abaixo para criar o ambiente virtual Python (`venv`), instalar as bibliotecas do backend e baixar os pacotes do frontend React (`node_modules`):
```bash
make install
```

### 2. Compilar o Frontend (Build de Produção)
Para gerar os arquivos estáticos de produção do frontend (HTML, CSS e JS transpilado/minificado) na pasta `frontend_react/dist`, execute:
```bash
make build-front
```
> **INFO:** O servidor Flask está configurado para servir diretamente a pasta `frontend_react/dist`. Ao compilar o frontend, o servidor Flask passa a funcionar como host único da aplicação completa.

### 3. Iniciar a Aplicação
Inicie o servidor Flask executando:
```bash
make run
```
Acesse o projeto em seu navegador pelo endereço: **http://localhost:5000**

---

## Execução em Modo de Desenvolvimento (Opcional)

Se desejar avaliar o projeto com suporte a Hot Module Replacement (HMR) e recarregamento automático no frontend:

1. Certifique-se de que o backend Flask está rodando em **http://localhost:5000** (usando `make run`).
2. Abra outro terminal e inicie o servidor de desenvolvimento do Vite com:
   ```bash
   make dev-front
   ```
3. Acesse a aplicação em **http://localhost:5173**

> **INFO:** O Vite está configurado para atuar como proxy das rotas `/api` e `/static`, redirecionando as requisições automaticamente para o backend Flask rodando na porta 5000.

> **WARN:** Lembre-se de compilar o frontend com `make build-front` caso decida rodar a aplicação exclusivamente através do Flask na porta 5000.
