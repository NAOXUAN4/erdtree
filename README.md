# ErdTree

```text
        [ main ]  o---o---o---o (HEAD)
                       \
         [ exp ]        o---o---o
                             \
         [ fix ]              o---o

```

**Git for LLM Conversations.**

ErdTree is a version control system designed for Large Language Model (LLM) interactions. It solves the structural contradiction between the linear nature of chat interfaces and the non-linear, branching nature of human engineering thought.

Instead of an endless, append-only text log, ErdTree treats conversations as a Directed Acyclic Graph (DAG).

## The Problem

Current LLM chat interfaces suffer from two fatal flaws in long-term tasks:

1. **Context Pollution:** Dead ends, abandoned ideas, and corrected mistakes remain in the context window, degrading the model's future outputs.
2. **One-Way Street:** Exploring an alternative architecture mid-conversation means either risking your current progress or opening a completely disconnected new chat.

## How ErdTree Works

ErdTree decouples storage from the LLM context window.

* **Nodes, Not Logs:** Every message is an independently addressable node, not a string appended to a log.
* **Explicit Branching:** Create a branch from any historical node to explore alternative ideas without polluting the main context.
* **Absolute Isolation:** The LLM only "sees" the exact path from the root to your current branch's HEAD. Sibling branches are completely isolated.

## Core Features

* **Git Graph Visualization:** Visual tree structure with branch lines and color-coded nodes.
* **Branch Management:** Create, switch, and traverse conversation branches from any message.
* **Context Isolation:** Each branch maintains independent context. Switch branches without cross-contamination.
* **Multi-Provider Support:** Configure multiple LLM providers (DeepSeek, OpenAI, Custom) and switch between them.
* **Markdown Rendering:** Full markdown support in conversation bubbles and tree visualization.
* **Stateless Architecture:** Compute (LLM) is stateless; Memory (Tree) is local. Switch models mid-conversation without losing your thought process.

## Quick Start

### Prerequisites

* Node.js >= 18.0
* An API key for your preferred LLM (DeepSeek, OpenAI, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/NAOXUAN4/erdtree.git
cd erdtree
```

2. Install dependencies:

```bash
npm install
```

3. Configure your API key:

Click the settings icon in the top-right corner, add your LLM configuration (API key, model, base URL), and set it as default.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Start a conversation in the main branch.
2. After receiving an assistant response, hover over the node in the sidebar and click the plus icon to create a new branch.
3. Switch between branches by clicking on them in the branch list.
4. View the full conversation tree in the Tree view.

## Tech Stack

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* Zustand (State Management)
* ReactFlow (Tree Visualization)
* DeepSeek API / OpenAI API

## License

MIT
